-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Table: admin_profiles
CREATE TABLE public.admin_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view their own profile" 
ON public.admin_profiles FOR SELECT 
USING (auth.uid() = user_id);

-- Table: site_config
CREATE TABLE public.site_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  singleton_key TEXT NOT NULL DEFAULT 'main' UNIQUE,
  brand JSONB NOT NULL DEFAULT '{}'::jsonb,
  contact JSONB NOT NULL DEFAULT '{}'::jsonb,
  social JSONB NOT NULL DEFAULT '{}'::jsonb,
  seo JSONB NOT NULL DEFAULT '{}'::jsonb,
  scripts JSONB NOT NULL DEFAULT '{}'::jsonb,
  page JSONB NOT NULL DEFAULT '{}'::jsonb,
  theme TEXT,
  sections JSONB NOT NULL DEFAULT '{}'::jsonb,
  section_order JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view site config" 
ON public.site_config FOR SELECT 
USING (true);

CREATE POLICY "Admins can update site config" 
ON public.site_config FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can insert site config" 
ON public.site_config FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));

-- Table: site_content
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX idx_site_content_draft ON public.site_content (status) WHERE (status = 'draft');
CREATE UNIQUE INDEX idx_site_content_published ON public.site_content (status) WHERE (status = 'published');

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published content" 
ON public.site_content FOR SELECT 
USING (status = 'published');

CREATE POLICY "Admins can view all content" 
ON public.site_content FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage content" 
ON public.site_content FOR ALL 
USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));

-- Table: content_versions
CREATE TABLE public.content_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content JSONB NOT NULL,
  config JSONB,
  created_by UUID REFERENCES auth.users(id),
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view versions" 
ON public.content_versions FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can insert versions" 
ON public.content_versions FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_admin_profiles_updated_at
BEFORE UPDATE ON public.admin_profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_site_config_updated_at
BEFORE UPDATE ON public.site_config
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_site_content_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Storage Bucket: site-assets
INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view site assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-assets');

CREATE POLICY "Admins can upload site assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'site-assets' AND 
  EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can update site assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'site-assets' AND 
  EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can delete site assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'site-assets' AND 
  EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid())
);
