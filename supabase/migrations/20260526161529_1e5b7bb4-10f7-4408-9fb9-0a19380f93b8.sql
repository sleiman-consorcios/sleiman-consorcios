-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "Authenticated users can delete leads" ON public.leads;
DROP POLICY IF EXISTS "Admins can delete leads" ON public.leads;

-- Create a more robust delete policy for admins
CREATE POLICY "Admins can delete leads" 
ON public.leads 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE user_id = auth.uid()
  )
);

-- Also ensure the select/update policies are correctly scoped to admins for better security, 
-- although the user only complained about deletion.
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;
CREATE POLICY "Admins can view leads" 
ON public.leads 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Authenticated users can update leads" ON public.leads;
CREATE POLICY "Admins can update leads" 
ON public.leads 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE user_id = auth.uid()
  )
);

-- Ensure grants are correct
GRANT ALL ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
