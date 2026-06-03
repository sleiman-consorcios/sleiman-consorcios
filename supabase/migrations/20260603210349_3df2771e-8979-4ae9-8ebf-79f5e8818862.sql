CREATE OR REPLACE FUNCTION public.tr_on_lead_created_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_url text;
  v_key text;
  v_headers jsonb;
  v_result_status int;
  v_result_text text;
BEGIN
  -- 1. Setup inicial do log no lead
  NEW.notification_log := jsonb_build_object(
    'triggered_at', now(),
    'status', 'attempting_trigger'
  );

  -- 2. Tenta pegar a URL do projeto (prioridade para a que já existe na internal_settings)
  SELECT value INTO v_url FROM public.internal_settings WHERE key = 'project_url';
  
  -- Se não existir, tenta inferir (Fallback)
  IF v_url IS NULL THEN
     -- Tenta pegar do contexto da requisição se disponível
     BEGIN
       v_headers := current_setting('request.headers', true)::jsonb;
       v_url := 'https://' || (v_headers->>'host');
     EXCEPTION WHEN OTHERS THEN
       v_url := NULL;
     END;
  END IF;

  -- 3. Tenta pegar a Anon Key
  SELECT value INTO v_key FROM public.internal_settings WHERE key = 'anon_key';
  
  -- Fallback para v_key do header se disponível
  IF v_key IS NULL THEN
     BEGIN
       v_headers := current_setting('request.headers', true)::jsonb;
       v_key := v_headers->>'apikey';
     EXCEPTION WHEN OTHERS THEN
       v_key := NULL;
     END;
  END IF;

  -- 4. Executa o disparo via pg_net (é assíncrono, então não sabemos o resultado imediato aqui)
  IF v_url IS NOT NULL AND v_key IS NOT NULL THEN
    -- Garante que a extensão pg_net está habilitada e funcionando
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
      NEW.notification_log := jsonb_insert(NEW.notification_log, '{url}', to_jsonb(v_url || '/functions/v1/send-lead-notification'));
    EXCEPTION WHEN OTHERS THEN
      NEW.notification_log := jsonb_set(NEW.notification_log, '{status}', '"error_pg_net_failed"');
      NEW.notification_log := jsonb_set(NEW.notification_log, '{error}', to_jsonb(SQLERRM));
    END;
  ELSE
    NEW.notification_log := jsonb_set(NEW.notification_log, '{status}', '"error_missing_config"');
    NEW.notification_log := jsonb_set(NEW.notification_log, '{details}', 
      jsonb_build_object('url_found', v_url IS NOT NULL, 'key_found', v_key IS NOT NULL)
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Garante que a anon_key esteja salva para o trigger funcionar
INSERT INTO public.internal_settings (key, value)
VALUES ('anon_key', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0a3FhY29rdWJ5d2hzZXZscXFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczOTg3MzMsImV4cCI6MjA5Mjk3NDczM30.g_qEWiKlIn-uQfeAvvrSLPr4aftqUI8my5-I7CkFXQY')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
