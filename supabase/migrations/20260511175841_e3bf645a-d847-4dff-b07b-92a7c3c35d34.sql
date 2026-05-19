ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS form_type TEXT;

COMMENT ON COLUMN public.leads.form_type IS 'Identifica qual formulário específico gerou o lead (ex: hero_modal, main_simulator, final_cta)';