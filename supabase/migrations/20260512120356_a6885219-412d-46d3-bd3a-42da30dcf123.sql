-- Ensure leads table has all implemented columns
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'income') THEN
        ALTER TABLE public.leads ADD COLUMN income TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'form_type') THEN
        ALTER TABLE public.leads ADD COLUMN form_type TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'has_lance') THEN
        ALTER TABLE public.leads ADD COLUMN has_lance TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'urgency') THEN
        ALTER TABLE public.leads ADD COLUMN urgency TEXT;
    END IF;
END $$;

-- Standardize table structure if not already present
-- (This ensures the table matches the expected schema even if previous migrations were partial)
ALTER TABLE IF EXISTS public.leads ENABLE ROW LEVEL SECURITY;

-- Re-apply or ensure policies exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Public can insert leads') THEN
        CREATE POLICY "Public can insert leads" ON public.leads FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Authenticated users can view leads') THEN
        CREATE POLICY "Authenticated users can view leads" ON public.leads FOR SELECT TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Authenticated users can update leads') THEN
        CREATE POLICY "Authenticated users can update leads" ON public.leads FOR UPDATE TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Authenticated users can delete leads') THEN
        CREATE POLICY "Authenticated users can delete leads" ON public.leads FOR DELETE TO authenticated USING (true);
    END IF;
END $$;

-- Update comments for clarity
COMMENT ON COLUMN public.leads.form_type IS 'Identifica qual formulário específico gerou o lead (ex: hero_modal, main_simulator, final_cta)';
COMMENT ON COLUMN public.leads.income IS 'Renda informada pelo usuário no formulário';
COMMENT ON COLUMN public.leads.has_lance IS 'Indica se o usuário possui reserva para lance';
