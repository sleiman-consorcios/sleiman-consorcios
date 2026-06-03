-- 1. Garante que a extensão pg_net está disponível
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Define o search_path da função para evitar ataques de sequestro de caminho e garantir acesso ao pg_net
ALTER FUNCTION public.tr_on_lead_created_notification() SET search_path = public, net;

-- 3. Ativa o gatilho explicitamente (estava em modo 'O' que significa desativado em alguns contextos de réplica ou manual)
ALTER TABLE public.leads ENABLE TRIGGER tr_on_lead_created_notification;
ALTER TABLE public.leads ENABLE TRIGGER update_leads_updated_at;

-- 4. Força o status do trigger para 'Always' (A) para garantir execução independente de configurações de sessão
ALTER TABLE public.leads ENABLE ALWAYS TRIGGER tr_on_lead_created_notification;
