-- ==========================================================
-- SCRIPT DE MIGRAÇÃO: ESTRUTURA COMPLETA DO BANCO DE DADOS
-- Projeto: Sleiman Consórcios
-- Atualizado em: 18 de Maio de 2026
-- ==========================================================

-- 1. Funções de Sistema
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2. Tabela de Perfis Administrativos
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view their own profile' AND tablename = 'admin_profiles') THEN
    CREATE POLICY "Admins can view their own profile" ON public.admin_profiles FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- 3. Tabela de Configuração do Site
CREATE TABLE IF NOT EXISTS public.site_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  singleton_key TEXT NOT NULL DEFAULT 'main' UNIQUE,
  brand JSONB NOT NULL DEFAULT '{}'::jsonb,
  contact JSONB NOT NULL DEFAULT '{}'::jsonb,
  social JSONB NOT NULL DEFAULT '{}'::jsonb,
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  scripts JSONB NOT NULL DEFAULT '{}'::jsonb,
  page JSONB NOT NULL DEFAULT '{}'::jsonb,
  form_fields JSONB NOT NULL DEFAULT '{"showCPF": true, "showIncome": true, "showBirthDate": true}'::jsonb,
  hide_brand_name BOOLEAN DEFAULT false,
  theme TEXT DEFAULT 'gold',
  sections JSONB NOT NULL DEFAULT '{}'::jsonb,
  section_order JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view site config' AND tablename = 'site_config') THEN
    CREATE POLICY "Public can view site config" ON public.site_config FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update site config' AND tablename = 'site_config') THEN
    CREATE POLICY "Admins can update site config" ON public.site_config FOR UPDATE USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can insert site config' AND tablename = 'site_config') THEN
    CREATE POLICY "Admins can insert site config" ON public.site_config FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));
  END IF;
END $$;

-- 4. Tabela de Conteúdo do Site
CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_site_content_draft') THEN
    CREATE UNIQUE INDEX idx_site_content_draft ON public.site_content (status) WHERE (status = 'draft');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_site_content_published') THEN
    CREATE UNIQUE INDEX idx_site_content_published ON public.site_content (status) WHERE (status = 'published');
  END IF;
END $$;

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view published content' AND tablename = 'site_content') THEN
    CREATE POLICY "Public can view published content" ON public.site_content FOR SELECT USING (status = 'published');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all content' AND tablename = 'site_content') THEN
    CREATE POLICY "Admins can view all content" ON public.site_content FOR SELECT USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage content' AND tablename = 'site_content') THEN
    CREATE POLICY "Admins can manage content" ON public.site_content FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));
  END IF;
END $$;

-- 5. Tabela de Versões de Conteúdo
CREATE TABLE IF NOT EXISTS public.content_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content JSONB NOT NULL,
  config JSONB,
  created_by UUID REFERENCES auth.users(id),
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view versions' AND tablename = 'content_versions') THEN
    CREATE POLICY "Admins can view versions" ON public.content_versions FOR SELECT USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can insert versions' AND tablename = 'content_versions') THEN
    CREATE POLICY "Admins can insert versions" ON public.content_versions FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));
  END IF;
END $$;

-- 6. Tabela de Leads
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  objective TEXT,
  credit TEXT,
  months TEXT,
  installment TEXT,
  income TEXT,
  cpf TEXT,
  birth_date TEXT,
  urgency TEXT,
  has_lance TEXT,
  status TEXT DEFAULT 'novo',
  source TEXT DEFAULT 'site',
  form_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all leads' AND tablename = 'leads') THEN
    CREATE POLICY "Admins can view all leads" ON public.leads FOR SELECT USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update leads' AND tablename = 'leads') THEN
    CREATE POLICY "Admins can update leads" ON public.leads FOR UPDATE USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can insert leads' AND tablename = 'leads') THEN
    CREATE POLICY "Public can insert leads" ON public.leads FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- 7. Triggers para atualização automática de timestamps
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_admin_profiles_updated_at') THEN
    CREATE TRIGGER update_admin_profiles_updated_at BEFORE UPDATE ON public.admin_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_site_config_updated_at') THEN
    CREATE TRIGGER update_site_config_updated_at BEFORE UPDATE ON public.site_config FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_site_content_updated_at') THEN
    CREATE TRIGGER update_site_content_updated_at BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_leads_updated_at') THEN
    CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- 8. Buckets de Armazenamento
-- Nota: Buckets no Supabase geralmente são criados via interface ou API de storage.
-- As políticas abaixo garantem acesso caso o bucket 'site-assets' seja criado.

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view site assets' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Public can view site assets" ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage site assets' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Admins can manage site assets" ON storage.objects FOR ALL USING (bucket_id = 'site-assets' AND EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));
  END IF;
END $$;
