DROP TRIGGER IF EXISTS tr_on_lead_created_notification ON public.leads;
DROP TRIGGER IF EXISTS trg_lead_notification ON public.leads;
DROP FUNCTION IF EXISTS tr_on_lead_created_notification();
DROP FUNCTION IF EXISTS handle_lead_notification();