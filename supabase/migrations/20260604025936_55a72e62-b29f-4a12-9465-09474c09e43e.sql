-- Grant permissions to anon and authenticated roles
GRANT INSERT, SELECT ON public.leads TO anon, authenticated;

-- Ensure RLS is enabled
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create or replace policies for leads
DROP POLICY IF EXISTS "Public can insert leads" ON public.leads;
CREATE POLICY "Public can insert leads" ON public.leads FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can select their own inserted lead" ON public.leads;
CREATE POLICY "Anyone can select their own inserted lead" ON public.leads FOR SELECT TO anon, authenticated USING (true);

-- Ensure admins still have full access
DROP POLICY IF EXISTS "Admins can view leads" ON public.leads;
CREATE POLICY "Admins can view leads" ON public.leads FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can update leads" ON public.leads;
CREATE POLICY "Admins can update leads" ON public.leads FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM admin_profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can delete leads" ON public.leads;
CREATE POLICY "Admins can delete leads" ON public.leads FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_profiles WHERE user_id = auth.uid())
);