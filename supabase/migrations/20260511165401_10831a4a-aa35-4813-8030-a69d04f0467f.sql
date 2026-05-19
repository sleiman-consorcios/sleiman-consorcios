-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  objective TEXT,
  credit TEXT,
  months TEXT,
  installment TEXT,
  urgency TEXT,
  has_lance TEXT,
  status TEXT DEFAULT 'pending', -- pending, sent, failed
  source TEXT, -- hero_simulator, main_simulator
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Public can insert leads" ON public.leads;
CREATE POLICY "Public can insert leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;
CREATE POLICY "Authenticated users can view leads" 
ON public.leads 
FOR SELECT 
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update leads" ON public.leads;
CREATE POLICY "Authenticated users can update leads" 
ON public.leads 
FOR UPDATE 
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete leads" ON public.leads;
CREATE POLICY "Authenticated users can delete leads" 
ON public.leads 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();