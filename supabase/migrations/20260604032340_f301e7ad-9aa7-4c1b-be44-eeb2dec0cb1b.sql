DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'traffic_source') THEN
        ALTER TABLE public.leads ADD COLUMN traffic_source TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'notification_log') THEN
        ALTER TABLE public.leads ADD COLUMN notification_log JSONB;
    END IF;
END $$;