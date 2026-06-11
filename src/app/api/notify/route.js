/**
 * @fileoverview Unified Notification API Route
 *
 * POST /api/notify
 *   Dispatches notifications across channels (email, WhatsApp, etc.).
 *
 *   Body: {
 *     type: 'order_confirmation' | 'status_update' | 'design_shared',
 *     to: string,           — Recipient email or phone number
 *     data: object          — Notification-specific payload
 *   }
 *
 *   Returns: { success: boolean, messageId?: string }
 *
 * Environment variables:
 *   - RESEND_API_KEY           — API key for Resend email service
 *   - NOTIFICATION_FROM_EMAIL  — Sender email (default: noreply@furnai.app)
 *   - WHATSAPP_API_TOKEN       — (Optional) WhatsApp Business API token
 *   - WHATSAPP_PHONE_ID        — (Optional) WhatsApp phone number ID
 */

import { NextResponse } from "next/server";
import { Resend } from "resend";

/** Supported notification types */
const NOTIFICATION_TYPES = ["order_confirmation", "status_update", "design_shared"];

/**
 * Lazily initialised Resend instance.
 * @type {Resend | null}
 */
let resendInstance = null;

/** @returns {Resend} */
function getResend() {
  if (!resendInstance) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not configured");
    resendInstance = new Resend(key);
  }
  return resendInstance;
}

/**
 * POST /api/notify
 *
 * @param {Request} request
 * @returns {Promise<NextResponse>}
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { type, to, data } = body;

    // ── Validate inputs ──────────────────────────────────────────────
    if (!type || !NOTIFICATION_TYPES.includes(type)) {
      return NextResponse.json(
        {
          error: `Invalid notification type. Must be one of: ${NOTIFICATION_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (!to || typeof to !== "string") {
      return NextResponse.json(
        { error: "'to' (recipient) is required" },
        { status: 400 }
      );
    }

    if (!data || typeof data !== "object") {
      return NextResponse.json(
        { error: "'data' object is required" },
        { status: 400 }
      );
    }

    // ── Determine channel ────────────────────────────────────────────
    const isPhone = /^\+?\d{7,15}$/.test(to.replace(/[\s\-()]/g, ""));
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to);

    if (isPhone && (process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_API_TOKEN)) {
      const result = await sendWhatsApp(type, to, data);
      return NextResponse.json({ success: true, channel: "whatsapp", ...result });
    }

    if (isEmail) {
      const result = await sendEmail(type, to, data);
      return NextResponse.json({ success: true, channel: "email", ...result });
    }

    return NextResponse.json(
      { error: "Could not determine notification channel from 'to' value" },
      { status: 400 }
    );
  } catch (err) {
    console.error("[notify] Error:", err);
    return NextResponse.json(
      { error: "Failed to send notification", detail: err.message },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Email dispatch (Resend)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends a notification email via Resend.
 *
 * @param {string} type  — Notification type
 * @param {string} to    — Recipient email
 * @param {object} data  — Template data
 * @returns {Promise<{ messageId: string }>}
 */
async function sendEmail(type, to, data) {
  const resend = getResend();
  const from = process.env.NOTIFICATION_FROM_EMAIL || "FurnAI <noreply@furnai.app>";
  const { subject, html } = buildEmailContent(type, data);

  const { data: result, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("[notify/email] Resend error:", error);
    throw new Error(error.message || "Email send failed");
  }

  return { messageId: result?.id };
}

/**
 * Builds email subject and HTML body based on notification type.
 *
 * @param {string} type
 * @param {object} data
 * @returns {{ subject: string, html: string }}
 */
function buildEmailContent(type, data) {
  switch (type) {
    case "order_confirmation":
      return {
        subject: `FurnAI — Order Confirmed #${data.orderId || ""}`,
        html: `
          <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1a1a2e; color: #e0e0ff; padding: 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">FurnAI</h1>
              <p style="margin: 4px 0 0; opacity: 0.8;">Order Confirmation</p>
            </div>
            <div style="padding: 24px; background: #ffffff;">
              <h2 style="color: #1a1a2e;">Thank you for your order!</h2>
              <p>Your order <strong>#${data.orderId || "N/A"}</strong> has been confirmed.</p>
              ${data.designName ? `<p>Design: <strong>${data.designName}</strong></p>` : ""}
              ${data.amount ? `<p>Total: <strong>${data.amount} ${data.currency || "AED"}</strong></p>` : ""}
              ${data.estimatedDays ? `<p>Estimated production time: <strong>${data.estimatedDays} days</strong></p>` : ""}
              <p style="color: #666; margin-top: 24px;">We'll send you updates as your order progresses.</p>
            </div>
            <div style="background: #f5f5f5; padding: 16px; text-align: center; color: #888; font-size: 12px;">
              © ${new Date().getFullYear()} FurnAI. All rights reserved.
            </div>
          </div>
        `,
      };

    case "status_update":
      return {
        subject: `FurnAI — Order #${data.orderId || ""} Status: ${data.status || "Updated"}`,
        html: `
          <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1a1a2e; color: #e0e0ff; padding: 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">FurnAI</h1>
              <p style="margin: 4px 0 0; opacity: 0.8;">Order Update</p>
            </div>
            <div style="padding: 24px; background: #ffffff;">
              <h2 style="color: #1a1a2e;">Order Status Update</h2>
              <p>Order <strong>#${data.orderId || "N/A"}</strong></p>
              <div style="background: #e8f4fd; border-left: 4px solid #2196F3; padding: 12px 16px; margin: 16px 0;">
                <strong>Status:</strong> ${data.status || "Processing"}
              </div>
              ${data.message ? `<p>${data.message}</p>` : ""}
              ${data.trackingUrl ? `<p><a href="${data.trackingUrl}" style="color: #2196F3;">Track your order →</a></p>` : ""}
            </div>
            <div style="background: #f5f5f5; padding: 16px; text-align: center; color: #888; font-size: 12px;">
              © ${new Date().getFullYear()} FurnAI. All rights reserved.
            </div>
          </div>
        `,
      };

    case "design_shared":
      return {
        subject: `${data.sharedBy || "Someone"} shared a FurnAI design with you`,
        html: `
          <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1a1a2e; color: #e0e0ff; padding: 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">FurnAI</h1>
              <p style="margin: 4px 0 0; opacity: 0.8;">Design Shared</p>
            </div>
            <div style="padding: 24px; background: #ffffff;">
              <h2 style="color: #1a1a2e;">A design was shared with you!</h2>
              <p><strong>${data.sharedBy || "A FurnAI user"}</strong> shared a furniture design with you.</p>
              ${data.designName ? `<p>Design: <strong>${data.designName}</strong></p>` : ""}
              ${data.message ? `<p style="color: #555; font-style: italic;">"${data.message}"</p>` : ""}
              ${data.viewUrl ? `<p><a href="${data.viewUrl}" style="display: inline-block; background: #1a1a2e; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Design →</a></p>` : ""}
            </div>
            <div style="background: #f5f5f5; padding: 16px; text-align: center; color: #888; font-size: 12px;">
              © ${new Date().getFullYear()} FurnAI. All rights reserved.
            </div>
          </div>
        `,
      };

    default:
      return {
        subject: "FurnAI Notification",
        html: `<p>${JSON.stringify(data)}</p>`,
      };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// WhatsApp dispatch (Meta Cloud API)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends a WhatsApp message via the Meta Cloud API.
 * Falls back to email if WhatsApp is not configured.
 *
 * @param {string} type  — Notification type
 * @param {string} to    — Recipient phone (E.164 format)
 * @param {object} data  — Template data
 * @returns {Promise<{ messageId: string }>}
 */
async function sendWhatsApp(type, to, data) {
  const token = process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (!token || !phoneId) {
    throw new Error("WhatsApp API is not configured (WHATSAPP_TOKEN or WHATSAPP_API_TOKEN, and WHATSAPP_PHONE_ID must be set)");
  }

  // Clean phone number to E.164 format
  const cleanPhone = to.replace(/[\s\-()]/g, "").replace(/^0+/, "");

  // Build plain-text message based on type
  const messageText = buildWhatsAppText(type, data);

  const response = await fetch(
    `https://graph.facebook.com/v21.0/${phoneId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: cleanPhone,
        type: "text",
        text: { body: messageText },
      }),
    }
  );

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    console.error("[notify/whatsapp] API error:", errBody);
    throw new Error(errBody.error?.message || `WhatsApp API returned ${response.status}`);
  }

  const result = await response.json();
  return { messageId: result.messages?.[0]?.id };
}

/**
 * Builds plain-text WhatsApp message body.
 *
 * @param {string} type
 * @param {object} data
 * @returns {string}
 */
function buildWhatsAppText(type, data) {
  switch (type) {
    case "order_confirmation":
      return [
        `✅ *FurnAI Order Confirmed*`,
        `Order: #${data.orderId || "N/A"}`,
        data.designName ? `Design: ${data.designName}` : null,
        data.amount ? `Total: ${data.amount} ${data.currency || "AED"}` : null,
        data.estimatedDays ? `Est. production: ${data.estimatedDays} days` : null,
        `\nWe'll keep you updated on progress!`,
      ]
        .filter(Boolean)
        .join("\n");

    case "status_update":
      return [
        `📦 *FurnAI Order Update*`,
        `Order: #${data.orderId || "N/A"}`,
        `Status: ${data.status || "Processing"}`,
        data.message ? `\n${data.message}` : null,
      ]
        .filter(Boolean)
        .join("\n");

    case "design_shared":
      return [
        `🎨 *FurnAI Design Shared*`,
        `${data.sharedBy || "Someone"} shared a design with you.`,
        data.designName ? `Design: ${data.designName}` : null,
        data.viewUrl ? `\nView it here: ${data.viewUrl}` : null,
      ]
        .filter(Boolean)
        .join("\n");

    default:
      return `FurnAI notification: ${JSON.stringify(data)}`;
  }
}
