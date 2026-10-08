import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

type EmailRequest = {
  name?: unknown;
  email?: unknown;
  serial?: unknown;
};

export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req) => {
    let body: EmailRequest;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { name, email, serial } = body;
    if (
      typeof name !== "string" || !name.trim() ||
      typeof email !== "string" || !email.trim() ||
      typeof serial !== "string" || !serial.trim()
    ) {
      return Response.json(
        { error: "Name, email, and serial are required." },
        { status: 400 },
      );
    }

    const mailerSendApiKey = Deno.env.get("MAILERSEND_API_KEY");
    const fromEmail = Deno.env.get("MAILERSEND_FROM_EMAIL");
    if (!mailerSendApiKey || !fromEmail) {
      console.error("MAILERSEND_API_KEY and MAILERSEND_FROM_EMAIL must be configured.");
      return Response.json(
        { error: "Email service is not configured." },
        { status: 500 },
      );
    }

    try {
      const mailerSendResponse = await fetch("https://api.mailersend.com/v1/email", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mailerSendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: { email: fromEmail, name: "EURESE Summit" },
          to: [{ email: email.trim(), name: name.trim() }],
          subject: "EURESE Summit serial number",
          text: `Hi ${name.trim()}, your EURESE Summit serial number is ${serial.trim()}. Bring this to the hall for entry.`,
          html: `<p>Hi ${escapeHtml(name.trim())},</p><p>Your serial number is:</p><h2>${escapeHtml(serial.trim())}</h2><p>Bring this to the hall for entry.</p>`,
        }),
      });

      const responseText = await mailerSendResponse.text();
      let result: { message?: unknown; message_id?: unknown; name?: unknown } = {};
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        result = {};
      }

      if (!mailerSendResponse.ok) {
        const providerMessage = typeof result?.message === "string"
          ? result.message
          : "MailerSend rejected the email request.";
        console.error("MailerSend rejected the email request:", {
          status: mailerSendResponse.status,
          name: result?.name,
          message: providerMessage,
        });
        return Response.json(
          { error: "The email provider rejected the request.", details: providerMessage },
          { status: 502 },
        );
      }

      return Response.json({
        ok: true,
        id: mailerSendResponse.headers.get("x-message-id") ?? result.message_id ?? null,
      });
    } catch (error) {
      console.error("Could not reach MailerSend:", error);
      return Response.json(
        { error: "Could not reach the email provider." },
        { status: 502 },
      );
    }
  }),
};

function escapeHtml(value: string) {
  const replacements: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return value.replace(/[&<>"']/g, (character) => replacements[character]);
}
