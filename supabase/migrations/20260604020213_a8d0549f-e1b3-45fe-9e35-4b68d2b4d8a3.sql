-- 1. Ensure pg_net is available
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Recreate the trigger function to be robust and use the latest logic
CREATE OR REPLACE FUNCTION public.tr_on_lead_created_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'net'
AS $function$
DECLARE
  v_url text;
  v_key text;
  v_headers jsonb;
BEGIN
  -- Setup initial log
  NEW.notification_log := jsonb_build_object(
    'triggered_at', now(),
    'status', 'attempting_trigger'
  );

  -- Get project settings
  SELECT value INTO v_url FROM public.internal_settings WHERE key = 'project_url';
  SELECT value INTO v_key FROM public.internal_settings WHERE key = 'anon_key';
  
  -- Fallbacks if settings are missing
  IF v_url IS NULL OR v_key IS NULL THEN
     BEGIN
       v_headers := current_setting('request.headers', true)::jsonb;
       IF v_url IS NULL THEN v_url := 'https://' || (v_headers->>'host'); END IF;
       IF v_key IS NULL THEN v_key := v_headers->>'apikey'; END IF;
     EXCEPTION WHEN OTHERS THEN
       -- Silently continue, we'll check again below
     END;
  END IF;

  -- Execute trigger via pg_net
  IF v_url IS NOT NULL AND v_key IS NOT NULL THEN
    BEGIN
      PERFORM net.http_post(
        url := v_url || '/functions/v1/send-lead-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || v_key,
          'apikey', v_key
        ),
        body := jsonb_build_object('record', row_to_json(NEW))
      );
      NEW.notification_log := jsonb_set(NEW.notification_log, '{status}', '"sent_to_net_queue"');
    EXCEPTION WHEN OTHERS THEN
      NEW.notification_log := jsonb_set(NEW.notification_log, '{status}', '"error_pg_net_failed"');
      NEW.notification_log := jsonb_set(NEW.notification_log, '{error}', to_jsonb(SQLERRM));
    END;
  ELSE
    NEW.notification_log := jsonb_set(NEW.notification_log, '{status}', '"error_missing_config"');
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 3. Apply the trigger
DROP TRIGGER IF EXISTS trg_lead_notification ON public.leads;
CREATE TRIGGER trg_lead_notification
BEFORE INSERT ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.tr_on_lead_created_notification();

-- 4. Ensure it's enabled
ALTER TABLE public.leads ENABLE ALWAYS TRIGGER trg_lead_notification;