interface LeadPayload {
  name?: string;
  phone?: string;
  objective?: string;
  creditRange?: string;
  installmentRange?: string;
  credit?: string;
  months?: string;
  installment?: string;
  hasLance?: string;
  message?: string;
}

/**
 * Dispara um POST opcional para o webhook configurado em site-config.json.
 * NUNCA bloqueia o fluxo principal (WhatsApp). Falhas são silenciosas (apenas console).
 */
export function sendLeadWebhook(webhookUrl: string | undefined, lead: LeadPayload): void {
  if (!webhookUrl || typeof webhookUrl !== "string") return;
  if (!/^https?:\/\//i.test(webhookUrl)) return;

  const payload = {
    ...lead,
    pageUrl: typeof window !== "undefined" ? window.location.href : "",
    source: "landing-sleiman-consorcios",
    createdAt: new Date().toISOString(),
  };

  // Fire-and-forget. keepalive permite que termine mesmo com navegação para WhatsApp.
  try {
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
      mode: "cors",
    }).catch(err => {
      // não bloqueia; apenas loga em dev
      if (typeof console !== "undefined") console.warn("[lead-webhook] falhou:", err);
    });
  } catch (err) {
    if (typeof console !== "undefined") console.warn("[lead-webhook] erro:", err);
  }
}
