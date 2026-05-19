ALTER TABLE public.site_config 
ADD COLUMN IF NOT EXISTS form_fields JSONB DEFAULT '{"showCPF": true, "showIncome": true, "showBirthDate": true}'::jsonb;