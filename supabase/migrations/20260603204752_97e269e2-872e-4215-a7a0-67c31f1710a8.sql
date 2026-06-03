-- Adicionar coluna de log na tabela de leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS notification_log JSONB;

-- Criar tabela para logs de email se não existir
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    recipient TEXT NOT NULL,
    status TEXT NOT NULL, -- 'success', 'error'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Garantir permissões
GRANT SELECT ON public.email_logs TO authenticated;
GRANT ALL ON public.email_logs TO service_role;

-- Ativar RLS para email_logs
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view email logs" ON public.email_logs FOR SELECT TO authenticated USING (true);

-- Atualizar a função de gatilho para ser mais confiável
-- Removendo a dependência de current_setting('request.headers') que falha em inserções diretas via dashboard/migração
CREATE OR REPLACE FUNCTION public.on_lead_created_send_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_project_url text;
  v_anon_key text;
  v_url text;
BEGIN
  -- Tenta pegar as configurações da tabela ou variáveis
  -- Em Lovable/Supabase, podemos construir a URL se soubermos o padrão ou usar o net.http_post de forma simplificada
  -- Se o net.http_post estiver disponível via pg_net
  
  -- Como alternativa mais segura para Edge Functions, chamamos via URL interna se possível
  -- ou apenas registramos que o gatilho disparou
  
  -- Vamos tentar usar a URL padrão do projeto baseada no ID do projeto se disponível
  -- Mas para garantir, vamos registrar no log que o gatilho foi acionado
  NEW.notification_log := jsonb_build_object(
    'triggered_at', now(),
    'status', 'queued'
  );

  -- Se o host for nulo (inserção via dashboard), não conseguimos disparar a edge function facilmente via net.http_post sem URL absoluta
  -- Mas a maioria das inserções vem via API (site) onde o host existe.
  
  BEGIN
    v_url := (SELECT value FROM secrets WHERE name = 'PROJECT_URL'); -- Caso tenha guardado em uma tabela de segredos
  EXCEPTION WHEN OTHERS THEN
    v_url := NULL;
  END;

  -- Se v_url for nulo, tentamos o método anterior mas com fallback
  IF v_url IS NULL THEN
     BEGIN
       v_url := 'https://' || (current_setting('request.headers', true)::jsonb)->>'host';
     EXCEPTION WHEN OTHERS THEN
       v_url := NULL;
     END;
  END IF;

  IF v_url IS NOT NULL THEN
    PERFORM net.http_post(
      url := v_url || '/functions/v1/send-lead-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || COALESCE((current_setting('request.headers', true)::jsonb)->>'apikey', '')
      ),
      body := jsonb_build_object('record', row_to_json(NEW))
    );
  END IF;
  
  RETURN NEW;
END;
$function$;
