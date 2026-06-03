ALTER TABLE public.leads ADD COLUMN traffic_source TEXT;

-- Garantir que a coluna source continue funcionando se usada, mas agora teremos traffic_source para a origem real.
COMMENT ON COLUMN public.leads.traffic_source IS 'Origem do tráfego: google, meta, organic, direct, etc';
