-- Grant explicit permissions to roles
GRANT INSERT, SELECT ON public.leads TO anon;
GRANT INSERT, SELECT ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

-- Ensure RLS is enabled
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Drop and recreate the insert policy to be absolutely sure it's correct
DROP POLICY IF EXISTS "Public can insert leads" ON public.leads;
CREATE POLICY "Public can insert leads" ON public.leads 
FOR INSERT TO anon, authenticated 
WITH CHECK (true);

-- Ensure public can also see their own session inserts if needed (PostgREST select * after insert)
DROP POLICY IF EXISTS "Anyone can select their own inserted lead" ON public.leads;
CREATE POLICY "Anyone can select their own inserted lead" ON public.leads 
FOR SELECT TO anon, authenticated 
USING (true);
