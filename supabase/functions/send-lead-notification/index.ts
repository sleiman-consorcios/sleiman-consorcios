import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    SUPABASE_URL!,
    SUPABASE_SERVICE_ROLE_KEY!
  );

  let record: any = null;

  try {
    const body = await req.json();
    record = body.record;

    console.log("[send-lead-notification] Invoked for lead:", record?.id, record?.name);

    await supabaseClient.from("email_logs").insert({
      lead_id: record?.id,
      recipient: "pending",
      status: "received",
    });

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY missing");
      await supabaseClient.from("email_logs").insert({
        lead_id: record?.id,
        recipient: "n/a",
        status: "error",
        error_message: "RESEND_API_KEY não configurada",
      });
      return new Response(JSON.stringify({ error: "RESEND_API_KEY missing" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const { data: configData } = await supabaseClient
      .from("site_config")
      .select("contact")
      .eq("singleton_key", "main")
      .single();

    const notificationEmail = (configData?.contact as any)?.notificationEmail || "sleimanconsorcios@gmail.com";
    const notificationEmailName = (configData?.contact as any)?.notificationEmailName || "Sleiman Consórcios";

    console.log(`[send-lead-notification] Sending to: ${notificationEmail}`);

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #121212; color: #ffffff; padding: 20px; border-radius: 8px;">
        <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 20px; border-bottom: 1px solid #333; padding-bottom: 10px;">
          Nova solicitação — Sleiman Consórcios
        </h2>
        <p style="color: #888; margin-bottom: 20px;">Formulário: ${record.form_type || 'Análise estratégica'}</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="border-bottom: 1px solid #333;"><td style="padding: 12px 0; font-weight: bold; width: 40%;">Nome</td><td style="padding: 12px 0;">${record.name}</td></tr>
          <tr style="border-bottom: 1px solid #333;"><td style="padding: 12px 0; font-weight: bold;">WhatsApp</td><td style="padding: 12px 0;">${record.phone}</td></tr>
          <tr style="border-bottom: 1px solid #333;"><td style="padding: 12px 0; font-weight: bold;">Renda mensal</td><td style="padding: 12px 0;">${record.income || '-'}</td></tr>
          <tr style="border-bottom: 1px solid #333;"><td style="padding: 12px 0; font-weight: bold;">Data de nascimento</td><td style="padding: 12px 0;">${record.birth_date || '-'}</td></tr>
          <tr style="border-bottom: 1px solid #333;"><td style="padding: 12px 0; font-weight: bold;">CPF</td><td style="padding: 12px 0;">${record.cpf || '-'}</td></tr>
          <tr style="border-bottom: 1px solid #333;"><td style="padding: 12px 0; font-weight: bold;">Objetivo</td><td style="padding: 12px 0;">${record.objective || '-'}</td></tr>
          <tr style="border-bottom: 1px solid #333;"><td style="padding: 12px 0; font-weight: bold;">Valor desejado</td><td style="padding: 12px 0;">${record.credit || '-'}</td></tr>
          <tr><td style="padding: 12px 0; font-weight: bold;">Tráfego</td><td style="padding: 12px 0;">${record.traffic_source || 'direct'}</td></tr>
        </table>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: notificationEmail.includes('@sleimanconsorcios.com.br') ? `Sleiman Consórcios <${notificationEmail}>` : `Sleiman Consórcios <onboarding@resend.dev>`,
        to: [notificationEmail],
        subject: `Nova solicitação — ${record.name}`,
        html: htmlContent,
      }),
    });

    const responseText = await res.text();
    console.log(`[send-lead-notification] Resend status: ${res.status} body: ${responseText}`);

    if (res.ok) {
      await supabaseClient.from("email_logs").insert({
        lead_id: record.id,
        recipient: notificationEmail,
        status: "success",
      });
      return new Response(responseText, {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      await supabaseClient.from("email_logs").insert({
        lead_id: record.id,
        recipient: notificationEmail,
        status: "error",
        error_message: `Resend ${res.status}: ${responseText}`,
      });
      return new Response(JSON.stringify({ error: responseText }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error: any) {
    console.error("[send-lead-notification] Exception:", error.message);
    try {
      await supabaseClient.from("email_logs").insert({
        lead_id: record?.id,
        recipient: "n/a",
        status: "error",
        error_message: `Exception: ${error.message}`,
      });
    } catch (_) {}
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
