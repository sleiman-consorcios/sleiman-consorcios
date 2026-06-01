-- DADOS COMPLETOS PARA MIGRAÇÃO
-- Gerado em: 2026-05-19T03:23:21.159Z

-- 1. ESTRUTURA
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
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view site assets' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Public can view site assets" ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage site assets' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Admins can manage site assets" ON storage.objects FOR ALL USING (bucket_id = 'site-assets' AND EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid()));
  END IF;
END $$;


-- 2. DADOS
TRUNCATE public.site_config CASCADE;
TRUNCATE public.site_content CASCADE;

-- Inserindo Configuração
INSERT INTO public.site_config (id, singleton_key, brand, contact, social, seo, scripts, page, theme, sections, section_order, form_fields)
VALUES (
    '8d0f6116-eb28-4d00-95a4-55a996a8f75e', 
    'main', 
    '{"logo": "https://gtkqacokubywhsevlqql.supabase.co/storage/v1/object/public/site-assets/upload/qp9g5zvgnc_1778861699076.png", "name": "Sleiman Consórcios", "favicon": "https://gtkqacokubywhsevlqql.supabase.co/storage/v1/object/public/site-assets/upload/pk474h0z1vc_1778188348794.png", "hideName": false, "headerCta": "Simule agora"}'::jsonb, 
    '{"cnpj": "54.175.908/0001-65", "email": "", "region": "Atendemos clientes em todo o país e no exterior", "whatsapp": "12974039898‬", "whatsappDisplay": "(12) 97403‑9898‬", "showWhatsappFloating": true}'::jsonb, 
    '{"tiktok": "https://www.tiktok.com/@sleimanconsorcios", "facebook": "https://www.facebook.com/profile.php?id=61564864266357", "linkedin": "https://www.linkedin.com/in/farid-abou-daher-253286147", "instagram": "https://www.instagram.com/reel/CtNDjuAvIBX/?igsh=ZHNzenEydmlncDF4"}'::jsonb, 
    '{"ogUrl": "", "title": "Sleiman Consórcios — Planejamento Patrimonial Inteligente", "ogImage": "https://gtkqacokubywhsevlqql.supabase.co/storage/v1/object/public/site-assets/upload/doo0livxdq_1778861056903.webp", "canonical": "https://sleimanconsorcio.com.br", "description": "Conquiste imóveis, veículos e forme patrimônio com estratégia, sem juros bancários. Consultoria personalizada com Farid Sleiman."}'::jsonb, 
    '{"gtmId": "", "metaPixelId": "", "additionalBodyScripts": "", "additionalHeadScripts": ""}'::jsonb, 
    '{"active": true, "unavailableTitle": "Página temporariamente indisponível", "unavailableMessage": "Estamos preparando novidades para você. Em breve estaremos de volta com ainda mais opções para o seu planejamento patrimonial."}'::jsonb, 
    'blue', 
    '{"faq": true, "hero": true, "news": false, "about": true, "videos": true, "cardapio": true, "finalCta": true, "security": true, "simulator": true, "comparison": true, "howItWorks": true, "objectives": true, "credibility": true, "promoBanner": true, "testimonials": true}'::jsonb, 
    '["promoBanner", "hero", "credibility", "about", "howItWorks", "objectives", "comparison", "cardapio", "simulator", "videos", "testimonials", "news", "security", "faq", "finalCta"]'::jsonb, 
    '{"showCPF": true, "showIncome": true, "showBirthDate": true}'::jsonb
);

-- Inserindo Conteúdo
INSERT INTO public.site_content (status, content, version)
VALUES (
    'published', 
    '{"faq": {"tag": "Perguntas frequentes", "items": [{"answer": "Não. O sorteio é uma das formas de contemplação, mas você também pode antecipar esse momento por meio de lance.\nCom uma análise personalizada, é possível entender qual estratégia faz mais sentido para sua realidade e aumentar suas chances de contemplação com planejamento.", "question": "Dependo de sorte para ser contemplado?"}, {"answer": "A contemplação pode acontecer por sorteio ou por lance. Pelo sorteio, não existe uma data garantida. Pelo lance, é possível criar uma estratégia para tentar antecipar esse momento, sempre de acordo com o grupo, o contrato e o valor disponível.", "question": "Quanto tempo leva para ser contemplado?"}, {"answer": "Não. O consórcio não tem juros como um financiamento tradicional. O que existe é uma taxa de administração, diluída nas parcelas, referente à gestão do grupo pela administradora.", "question": "Consórcio tem juros?"}, {"answer": "Sim, desde que seja feito com uma administradora autorizada. O sistema de consórcios é regulado e supervisionado pelo Banco Central do Brasil, o que traz mais segurança para quem quer comprar um bem de forma planejada.", "question": "O consórcio é seguro?"}, {"answer": "Sim. No consórcio de imóveis, a carta de crédito pode ser usada para comprar imóvel novo ou usado, terreno, construção ou reforma, conforme as regras do plano contratado.", "question": "Posso usar a carta para comprar imóvel usado, terreno, construir ou reformar?"}, {"answer": "Sim. No consórcio de imóveis, o FGTS pode ser usado em algumas situações, como ofertar lance, complementar o valor da carta, amortizar ou quitar saldo devedor, desde que esteja de acordo com as regras da Caixa e da legislação vigente.", "question": "Posso usar meu FGTS no consórcio?"}, {"answer": "Em caso de atraso, sua participação nos sorteios pode ser suspensa temporariamente, mas o contrato não é cancelado automaticamente. Ao regularizar os pagamentos, você volta a participar normalmente, conforme as regras da administradora.", "question": "O que acontece se eu atrasar uma parcela?"}, {"answer": "Em muitos casos, sim. Você pode usar parte do valor disponível para ofertar um lance, buscar a contemplação e manter o restante do dinheiro aplicado ou reservado para outras prioridades. O ideal é fazer um estudo personalizado para entender se essa estratégia faz sentido para o seu objetivo.", "question": "Vale a pena fazer consórcio mesmo tendo dinheiro para comprar à vista?"}], "title": "Respostas claras para as perguntas mais comuns sobre consórcio.", "subtitle": ""}, "nav": [{"href": "#inicio", "label": "Home"}, {"href": "#como-funciona", "label": "Como funciona"}, {"href": "#solucoes", "label": "Soluções"}, {"href": "#sobre", "label": "Nosso time"}, {"href": "#simulacao", "label": "Simulação"}, {"href": "#depoimentos", "label": "Depoimentos"}, {"href": "#faq", "label": "Dúvidas"}], "hero": {"image": "https://gtkqacokubywhsevlqql.supabase.co/storage/v1/object/public/site-assets/upload/q94wg6nmyel_1777989611144.png", "eyebrow": "Consórcio com quem entende", "headline": "Realize seu sonho — sem pagar juros", "trustText": "Muitas famílias já realizaram seus sonhos com a Sleiman", "ctaPrimary": {"href": "#", "text": "Simular"}, "subheadline": "Mais de 20 anos no mercado imobiliário, agora trabalhando por você. Consultoria especializada, sem burocracia, com quem realmente conhece o mercado.", "trustBadges": [], "ctaSecondary": {"href": "#", "text": "Contato"}, "verticalAlign": "top"}, "news": {"items": [{"tag": "imprensa", "url": "https://g1.globo.com/sp/bauru-marilia/especial-publicitario/grupo-comauto-planeje-suas-conquistas-com-o-grupo-comauto/noticia/2026/02/24/como-usar-o-consorcio-para-investir-e-nao-apenas-comprar-bens.ghtml", "image": "", "title": "Como usar o consórcio para investir e não apenas comprar bens"}, {"tag": "tendência", "url": "https://www.consorciocred.com/cota-contemplada-o-que-e-e-por-que-tanta-gente-esta-comprando-em-2026/", "image": "", "title": "O que é e por que tanta gente está comprando em 2026?"}, {"tag": "investimento", "url": "https://g1.globo.com/sp/bauru-marilia/especial-publicitario/grupo-comauto-planeje-suas-conquistas-com-o-grupo-comauto/noticia/2026/02/24/como-usar-o-consorcio-para-investir-e-nao-apenas-comprar-bens.ghtml", "image": "", "title": "Como usar o consórcio para investir e não apenas comprar bens"}], "title": "Matérias e Notícias", "subtitle": "Acompanhe as principais novidades do mercado"}, "about": {"text": "Com passagem por grandes incorporadoras e uma trajetória sólida no setor imobiliário brasileiro, Farid Abou Daher traz um nível de consultoria que grandes corretoras não conseguem oferecer: atenção personalizada de quem já viu tudo no mercado.", "badge": "", "image": "https://gtkqacokubywhsevlqql.supabase.co/storage/v1/object/public/site-assets/upload/dleuvl3gj0m_1777991020561.webp", "quote": "Passei 20 anos no mercado imobiliário vendo pessoas pagarem o triplo pelo mesmo imóvel. Sleiman chegou para mudar tudo isso.", "title": "Sobre nosso Gestor", "metrics": [{"label": "Anos no mercado imobiliário", "value": "20+"}, {"label": "Foco no seu resultado", "value": "100%"}, {"label": "É o foco", "value": "Você"}], "subtitle": "", "highlights": [], "founderName": "Farid Abou Daher", "founderRole": "Diretor Comercial"}, "footer": {"legal": "", "terms": "", "navLinks": [], "description": "", "productLinks": [], "privacyPolicy": ""}, "videos": {"tag": "Aprenda com quem sabe", "items": [{"tag": "Entrevista", "url": "https://youtu.be/jL6XO-Azp7Q?si=b6qHZ5TZbAuTo_YW", "title": "Conheça Farid Abou Daher: Experiência e Inovação no Mercado Imobiliário", "thumbnail": "", "description": ""}, {"tag": "Entrevista", "url": "https://www.youtube.com/watch?v=dR4pv1qAhnk", "title": "Gente em Destaque: Farid Abou:", "thumbnail": "", "description": ""}, {"tag": "Podcast", "url": "https://youtu.be/gZKUJ4pGf4M?si=ju9zaYN6-UQnG_IO", "title": "Mercado Imobiliário com Farid Abou Daher no Podcastano", "thumbnail": "", "description": ""}], "title": "Vídeos", "subtitle": "Farid compartilha sua experiência de 20 anos no mercado. Assista antes de decidir.", "clickAction": "modal"}, "cardapio": {"items": [{"image": "https://gtkqacokubywhsevlqql.supabase.co/storage/v1/object/public/site-assets/upload/go7osmwveo8_1778203411562.webp", "title": "Carro novo", "totalValue": 150000, "installmentText": 1338}, {"image": "https://gtkqacokubywhsevlqql.supabase.co/storage/v1/object/public/site-assets/upload/8qdozea6i7j_1778037645478.webp", "title": "Casa nova", "totalValue": 900000, "installmentText": 2861.31}, {"image": "https://gtkqacokubywhsevlqql.supabase.co/storage/v1/object/public/site-assets/upload/t8he9w7xp4_1778037727369.webp", "title": "Aumentar Frota", "totalValue": 300000, "installmentText": 2676}, {"image": "https://gtkqacokubywhsevlqql.supabase.co/storage/v1/object/public/site-assets/upload/9b30l7r6q9_1778037786506.webp", "title": "Construir", "totalValue": 560000, "installmentText": 1780.34}, {"image": "https://gtkqacokubywhsevlqql.supabase.co/storage/v1/object/public/site-assets/upload/be705zi68oe_1778037822304.webp", "title": "Meu apto", "totalValue": 400000, "installmentText": 1271.35}], "title": "Ofertas", "ctaText": "Aproveitar", "subtitle": ""}, "finalCta": {"tag": "Comece agora", "title": "Qual é o seu objetivo?", "ctaForm": "Enviar solicitação", "subtitle": "Simulação gratuita e sem compromisso. O time da Sleiman consórcios entra em contato pessoalmente.", "objectives": ["🚗 Comprar meu carro", "🏠 Comprar minha casa", "🛻 Aumentar minha frota", "💰 Investimento"], "ctaWhatsapp": "Quero minha simulação gratuita", "privacyText": "🔒 Seus dados estão protegidos · Nenhuma abordagem invasiva ", "creditOptions": ["Até R$ 100.000", "Entre R$ 100k e R$ 300k", "Entre R$ 300k e R$ 600k", "Entre R$ 600k e R$ 1M", "Acima de R$ 1M"]}, "security": {"tag": "Segurança e transparência", "title": "Trabalhamos apenas com administradoras regulamentadas e processos 100% transparentes.", "points": [{"icon": "", "title": "Administradoras regulamentadas", "description": "Todas as administradoras parceiras são autorizadas e fiscalizadas pelo Banco Central."}, {"icon": "", "title": "Contratação segura", "description": "Processo digital seguro com suporte humano em cada etapa da contratação."}, {"icon": "", "title": "Transparência total", "description": "Sem letras miúdas. Todas as condições são explicadas de forma clara antes da contratação."}, {"icon": "", "title": "Suporte contínuo", "description": "Acompanhamento ativo mesmo após a contratação, com orientação em assembleias e lances."}], "subtitle": ""}, "simulator": {"calc": {"plans": [{"creditValue": 200000, "installment": 641.6, "interestRate": 0}, {"creditValue": 250000, "installment": 802, "interestRate": 0}, {"creditValue": 300000, "installment": 962.4, "interestRate": 0}, {"creditValue": 400000, "installment": 1283.2, "interestRate": 0}, {"creditValue": 500000, "installment": 1604, "interestRate": 0}, {"creditValue": 600000, "installment": 1924.8, "interestRate": 0}, {"creditValue": 750000, "installment": 2406, "interestRate": 0}, {"creditValue": 800000, "installment": 2566.4, "interestRate": 0}, {"creditValue": 900000, "installment": 2887.28, "interestRate": 0}, {"creditValue": 1000000, "installment": 3208, "interestRate": 0}, {"creditValue": 1100000, "installment": 3528.8, "interestRate": 0}, {"creditValue": 1200000, "installment": 3849.6, "interestRate": 0}, {"creditValue": 1300000, "installment": 4170.48, "interestRate": 0}], "badges": [], "ctaText": "Simular", "adminRate": 9, "creditMax": 1300000, "creditMin": 210000, "creditStep": 47000, "privacyText": "Privacidade", "prazoDefault": 100, "prazoOptions": [{"label": "240 meses", "value": 240}], "creditDefault": 100000, "showAdminRate": false, "reductionFactor": 70, "vehicleAdminRate": 10, "vehicleMaxCredit": 300000, "vehicleMinCredit": 80000, "vehicleCreditStep": 10000, "vehiclePrazoOptions": [{"label": "80 meses", "value": 80}], "vehicleReductionFactor": 64.85}, "title": "Simulador", "features": [{"desc": "Economize até 3x mais que um financiamento comum.", "title": "SEM JUROS"}, {"desc": "Prazos e parcelas que cabem no seu orçamento.", "title": "FLEXIBILIDADE"}, {"desc": "Suporte especializado do início até a contemplação.", "title": "CONSULTORIA"}], "subtitle": "", "objectives": [], "creditRanges": [], "installmentRanges": []}, "comparison": {"tag": "", "rows": [{"feature": "Entrada obrigatória", "financing": "R$ 100.000", "consortium": "Sem entrada"}, {"feature": "Parcela mensal", "financing": "R$ 4.594/mês", "consortium": "R$ 1.691/mês*"}, {"feature": "Prazo", "financing": "420 meses", "consortium": "200 meses"}, {"feature": "Total de juros", "financing": "420% (mais de R$ 700k)", "consortium": "Zero juros"}, {"feature": "Custo total final", "financing": "R$ 1.256.171", "consortium": "R$ 615.000"}], "title": "Consórcio vs Financiamento", "ctaText": "Quero economizar assim →", "headers": ["Característica", "Consórcio", "Financiamento"], "subtitle": "Simulação para um imóvel de R$ 500.000. Os números não mentem.", "disclaimer": "Valores ilustrativos. As condições variam conforme perfil, administradora e estratégia adotada.", "savingsText": "Você economiza R$ 641.000 💰"}, "howItWorks": {"steps": [{"icon": "", "title": "Simulação", "number": "01", "description": "Você escolhe o valor e o prazo que melhor se adaptam ao seu momento financeiro."}, {"icon": "", "title": "Consultoria", "number": "02", "description": "Analisamos as melhores oportunidades do mercado para garantir a sua contemplação."}, {"icon": "", "title": "Conquista", "number": "03", "description": "Com a carta de crédito em mãos, você realiza a compra do seu bem sem pagar juros."}], "title": "Como funciona", "subtitle": ""}, "objectives": {"cards": [{"cta": "Simular agora", "icon": "🏠", "title": "Quero comprar meu imóvel", "description": "Conquiste a casa própria com planejamento, sem entrada obrigatória e sem juros bancários."}, {"cta": "Simular agora", "icon": "📊", "title": "Quero formar patrimônio", "description": "Use o consórcio como ferramenta estratégica para construir patrimônio sólido ao longo do tempo."}, {"cta": "Simular agora", "icon": "💡", "title": "Quero investir com inteligência", "description": "Diversifique com crédito programado, aproveitando lances estratégicos e valorização patrimonial."}, {"cta": "Simular agora", "icon": "🔄", "title": "Quero quitar um financiamento", "description": "Troque juros bancários por um consórcio inteligente e reduza significativamente o custo total."}], "title": "Qual é o seu objetivo?", "subtitle": "Cada plano é personalizado conforme a sua realidade e suas metas."}, "credibility": {"stats": [{"icon": "Award", "label": "Anos no mercado imobiliário", "value": "20+"}, {"icon": "Users", "label": "De juros pagos pelos nossos clientes", "value": "R$0"}, {"icon": "DollarSign", "label": "Redução na parcela até a contemplação", "value": "45%"}, {"icon": "MapPin", "label": "Regulamentado pelo Banco Central", "value": "100%"}], "title": "Nossos números", "partners": {"logos": [{"name": "Porto Seguro", "image": "https://gtkqacokubywhsevlqql.supabase.co/storage/v1/object/public/site-assets/upload/tzpty9blnlg_1777989665182.webp"}, {"name": "Santander", "image": "https://gtkqacokubywhsevlqql.supabase.co/storage/v1/object/public/site-assets/upload/a063kso2u2_1778034933861.webp"}, {"name": "Itaú", "image": "https://gtkqacokubywhsevlqql.supabase.co/storage/v1/object/public/site-assets/upload/nz095ur3a0a_1778519055357.png"}], "title": "Representante autorizado"}}, "promoBanner": {"slides": [{"alt": "", "src": "https://gtkqacokubywhsevlqql.supabase.co/storage/v1/object/public/site-assets/upload/3g9lyuqy1n9_1778172656713.png", "type": "image", "assetUrl": "https://gtkqacokubywhsevlqql.supabase.co/storage/v1/object/public/site-assets/upload/jsl1daykk7p_1777989504590.mp4", "mobileSrc": "https://gtkqacokubywhsevlqql.supabase.co/storage/v1/object/public/site-assets/upload/dgoim17ullr_1778376472306.png"}, {"alt": "", "src": "https://gtkqacokubywhsevlqql.supabase.co/storage/v1/object/public/site-assets/upload/o0e0t3p6e4_1778376491159.png", "type": "image", "assetUrl": "https://gtkqacokubywhsevlqql.supabase.co/storage/v1/object/public/site-assets/upload/cvw9xxcznio_1777989578150.mp4", "mobileSrc": "https://gtkqacokubywhsevlqql.supabase.co/storage/v1/object/public/site-assets/upload/i2xro4bmmdt_1778376507854.png"}, {"alt": "", "src": "https://gtkqacokubywhsevlqql.supabase.co/storage/v1/object/public/site-assets/upload/to92l3wmw1_1778172738586.png", "type": "image", "assetUrl": "https://gtkqacokubywhsevlqql.supabase.co/storage/v1/object/public/site-assets/upload/e47iwslw3sn_1777989584448.mp4", "mobileSrc": "https://gtkqacokubywhsevlqql.supabase.co/storage/v1/object/public/site-assets/upload/asvpmsrmqa_1778376525892.png"}], "ctaHref": "#simulacao", "ctaText": "Simule agora", "countdownDate": "2026-05-13 00:00", "countdownText": "Campanha 50% off", "showCountdown": true}, "testimonials": {"tag": "Clientes reais", "items": [{"city": "Cliente satisfeito", "name": "Maricelio Lopes", "role": "Cliente", "text": "Gostei muito por ser rápido e pela praticidade. Ainda mais pra mim que  sempre estou no trabalho corrido do dia a dia. Entrei em contato num dia e no outro já estava com o consórcio em mão.  Tudo pela Internet.\nGratidão.", "image": "", "rating": 5}, {"city": "Cliente satisfeito", "name": "José Fabio Oliveira", "role": "Cliente", "text": "A Sleiman Consórcio é uma empresa diferenciada na venda de Consórcio, pois oferece ao seu cliente  informações, acompanhamento e as melhores condições e cartas  de acordo com suas necessidades e expectativas e sobretudo respeitando o seu momento  financeiro.", "image": "", "rating": 5}, {"city": "Cliente satisfeito", "name": "Juliano L.", "role": "Cliente", "text": "Meu atendimento foi ótimo muito bem atendido e assessoria completa estao de parabéns recomendo. ", "image": "", "rating": 5}], "title": "Histórias de quem já realizou", "subtitle": ""}}'::jsonb, 
    1
);
