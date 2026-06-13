/**
 * @fileoverview Contact Form API Route
 *
 * POST /api/contact
 *   Receives contact form submissions and forwards them via email
 *   using the Resend service. Falls back to a success response
 *   if Resend is not configured (for development).
 *
 *   Body: { name: string, email: string, message: string }
 *   Returns: { success: boolean }
 */

import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();

    // Validate inputs
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Try sending via Resend
    const resendKey = process.env.RESEND_API_KEY;

    if (resendKey) {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);

      const fromEmail =
        process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

      const { error } = await resend.emails.send({
        from: fromEmail,
        to: process.env.CONTACT_RECIPIENT_EMAIL || "xalimov.beka99@gmail.com",
        subject: `FurnAI Contact: ${name}`,
        replyTo: email,
        html: `
          <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1a1a2e; color: #e0e0ff; padding: 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">FurnAI</h1>
              <p style="margin: 4px 0 0; opacity: 0.8;">New Contact Message</p>
            </div>
            <div style="padding: 24px; background: #ffffff;">
              <h2 style="color: #1a1a2e; margin-top: 0;">New message from ${name}</h2>
              <div style="background: #f8f9fa; border-left: 4px solid #2196F3; padding: 12px 16px; margin: 16px 0;">
                <p style="margin: 0;"><strong>From:</strong> ${name}</p>
                <p style="margin: 4px 0 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              </div>
              <div style="margin-top: 16px;">
                <strong>Message:</strong>
                <p style="white-space: pre-wrap; color: #333; line-height: 1.6;">${message}</p>
              </div>
            </div>
            <div style="background: #f5f5f5; padding: 16px; text-align: center; color: #888; font-size: 12px;">
              © ${new Date().getFullYear()} FurnAI. Contact form submission.
            </div>
          </div>
        `,
      });

      if (error) {
        console.error("[contact] Resend error:", error);
        return NextResponse.json(
          { error: "Failed to send email. Please try again later." },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // Fallback: log the message if Resend is not configured
    console.log("[contact] Message received (no email service configured):", {
      name,
      email,
      message: message.substring(0, 100),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact] Error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
