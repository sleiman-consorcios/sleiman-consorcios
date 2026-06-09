ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS knows_consortium TEXT;
COMMENT ON COLUMN public.leads.knows_consortium IS 'Registra se o lead já conhece consórcio (Sim/Não).';
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;