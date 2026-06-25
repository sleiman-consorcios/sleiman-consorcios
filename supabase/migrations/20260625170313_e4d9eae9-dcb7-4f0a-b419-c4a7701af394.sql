
CREATE TABLE public.whatsapp_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  message TEXT,
  traffic_source TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.whatsapp_clicks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_clicks TO authenticated;
GRANT ALL ON public.whatsapp_clicks TO service_role;

ALTER TABLE public.whatsapp_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert whatsapp clicks"
  ON public.whatsapp_clicks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view whatsapp clicks"
  ON public.whatsapp_clicks FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid()));

CREATE POLICY "Admins can delete whatsapp clicks"
  ON public.whatsapp_clicks FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid()));

CREATE INDEX whatsapp_clicks_created_at_idx ON public.whatsapp_clicks (created_at DESC);
