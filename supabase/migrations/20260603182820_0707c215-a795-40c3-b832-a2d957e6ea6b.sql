CREATE OR REPLACE FUNCTION public.on_lead_created_send_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_host text;
  v_apikey text;
  v_url text;
BEGIN
  -- Extração simples dos headers
  v_host := (current_setting('request.headers', true)::jsonb)->>'host';
  v_apikey := (current_setting('request.headers', true)::jsonb)->>'apikey';

  IF v_host IS NOT NULL AND v_apikey IS NOT NULL THEN
    v_url := 'https://' || v_host || '/functions/v1/send-lead-notification';
    PERFORM net.http_post(
      url := v_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_apikey
      ),
      body := jsonb_build_object('record', row_to_json(NEW))
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
