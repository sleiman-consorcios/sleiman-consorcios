-- Ajustar a função para ter search_path definido e restringir execução
ALTER FUNCTION public.on_lead_created_send_notification() SET search_path = public;

-- Revogar permissão de execução direta por anon e authenticated, já que é uma função de gatilho
REVOKE EXECUTE ON FUNCTION public.on_lead_created_send_notification() FROM public;
REVOKE EXECUTE ON FUNCTION public.on_lead_created_send_notification() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.on_lead_created_send_notification() FROM anon;

-- Permitir execução apenas pelo postgres (trigger) e service_role
GRANT EXECUTE ON FUNCTION public.on_lead_created_send_notification() TO postgres;
GRANT EXECUTE ON FUNCTION public.on_lead_created_send_notification() TO service_role;
