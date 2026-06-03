-- Garantir que a tabela existe
CREATE TABLE IF NOT EXISTS public.internal_settings (
    key TEXT PRIMARY KEY,
    value TEXT, -- Removido NOT NULL temporariamente para evitar erros de migração
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir URL do projeto
INSERT INTO public.internal_settings (key, value) 
VALUES ('project_url', 'https://gtkqacokubywhsevlqql.supabase.co')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Atualizar o gatilho para ser mais resiliente
CREATE OR REPLACE FUNCTION public.on_lead_created_send_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_url text;
  v_key text;
  v_headers jsonb;
BEGIN
  -- 1. Log inicial
  NEW.notification_log := jsonb_build_object(
    'triggered_at', now(),
    'status', 'queued'
  );

  -- 2. Tenta pegar do banco
  SELECT value INTO v_url FROM public.internal_settings WHERE key = 'project_url';
  SELECT value INTO v_key FROM public.internal_settings WHERE key = 'anon_key';

  -- 3. Tenta pegar do contexto da requisição (se houver)
  BEGIN
    v_headers := current_setting('request.headers', true)::jsonb;
    IF v_url IS NULL THEN
      v_url := 'https://' || (v_headers->>'host');
    END IF;
    IF v_key IS NULL THEN
      v_key := v_headers->>'apikey';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Silenciar erros se não houver contexto de requisição
  END;

  -- 4. Se ainda não temos a chave, usamos uma constante se for necessário ou apenas abortamos o envio (mas logamos)
  IF v_url IS NOT NULL AND v_key IS NOT NULL THEN
    PERFORM net.http_post(
      url := v_url || '/functions/v1/send-lead-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_key
      ),
      body := jsonb_build_object('record', row_to_json(NEW))
    );
    NEW.notification_log := jsonb_set(NEW.notification_log, '{status}', '"sent_to_queue"');
  ELSE
    NEW.notification_log := jsonb_set(NEW.notification_log, '{status}', '"error_missing_config"');
    NEW.notification_log := jsonb_set(NEW.notification_log, '{details}', 
      jsonb_build_object('url_found', v_url IS NOT NULL, 'key_found', v_key IS NOT NULL)
    );
  END IF;
  
  RETURN NEW;
END;
$function$;
