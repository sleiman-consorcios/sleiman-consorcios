CREATE EXTENSION IF NOT EXISTS pg_net;

-- Função que será chamada pelo trigger para enviar a notificação
CREATE OR REPLACE FUNCTION public.on_lead_created_send_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Chama a edge function enviando o registro como payload
  -- Nota: O URL da função é composto pelo ID do projeto.
  -- Usamos o vault ou segredos se possível, mas aqui usaremos a variável de ambiente se disponível no contexto do SQL (raro).
  -- Alternativamente, o Supabase gerencia isso via webhooks.
  -- Como não temos a URL exata fácil, vamos assumir que o usuário pode configurar o webhook no painel Supabase.
  
  -- Para garantir que funcione via código agora:
  PERFORM net.http_post(
    url := 'https://' || current_setting('request.headers')::json->>'host' || '/functions/v1/send-lead-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('request.headers')::json->>'apikey'
    ),
    body := jsonb_build_object('record', row_to_json(NEW))
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para chamar a função após a inserção de um lead
DROP TRIGGER IF EXISTS tr_on_lead_created_notification ON public.leads;
CREATE TRIGGER tr_on_lead_created_notification
AFTER INSERT ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.on_lead_created_send_notification();

GRANT ALL ON public.leads TO service_role;
GRANT ALL ON public.leads TO authenticated;
GRANT ALL ON public.leads TO anon;
