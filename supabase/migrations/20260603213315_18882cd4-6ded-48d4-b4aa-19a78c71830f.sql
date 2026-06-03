
DROP TRIGGER IF EXISTS trg_lead_notification ON public.leads;
CREATE TRIGGER trg_lead_notification
BEFORE INSERT ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.tr_on_lead_created_notification();
