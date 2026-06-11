/**
 * @fileoverview Stripe Webhook Handler
 *
 * POST /api/payments/webhook
 *   Receives and verifies Stripe webhook events.
 *
 *   Handled events:
 *   - checkout.session.completed  → Updates order status to 'paid' in Supabase
 *   - payment_intent.payment_failed → Logs failure and updates order status
 *
 * Security:
 *   - Verifies webhook signature using STRIPE_WEBHOOK_SECRET
 *   - Reads raw body for signature verification
 *
 * Environment variables:
 *   - STRIPE_SECRET_KEY
 *   - STRIPE_WEBHOOK_SECRET
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

/** Force Node.js runtime for raw body access */
export const runtime = "nodejs";

/**
 * Lazily initialised Stripe instance.
 * @type {Stripe | null}
 */
let stripeInstance = null;

/** @returns {Stripe} */
function getStripe() {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
    });
  }
  return stripeInstance;
}

/**
 * Creates a Supabase admin client (service-role) for server-side writes.
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * POST /api/payments/webhook
 *
 * Stripe sends events here. We verify the signature, then dispatch based
 * on the event type.
 *
 * @param {Request} request
 * @returns {Promise<NextResponse>}
 */
export async function POST(request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 503 }
    );
  }

  let event;

  try {
    // ── Read raw body and verify signature ────────────────────────────
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err.message);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  // ── Handle events ─────────────────────────────────────────────────
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;

      default:
        // Log unhandled event types for visibility during development
        console.log(`[webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`[webhook] Error handling ${event.type}:`, err);
    // Return 200 to prevent Stripe from retrying (we already logged the error)
    return NextResponse.json({ received: true, error: err.message });
  }
}

/**
 * Handles a successful checkout session.
 * Updates the order status to 'paid' and records payment details in Supabase.
 *
 * @param {Stripe.Checkout.Session} session
 */
async function handleCheckoutCompleted(session) {
  const { orderId, designId } = session.metadata || {};

  if (!orderId) {
    console.warn("[webhook] checkout.session.completed without orderId metadata");
    return;
  }

  console.log(`[webhook] Payment completed for order ${orderId} (design ${designId})`);

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("orders")
    .update({
      status: "paid",
      payment_status: "completed",
      stripe_session_id: session.id,
      stripe_payment_intent: session.payment_intent,
      amount_paid: session.amount_total,
      currency: session.currency,
      customer_email: session.customer_details?.email || null,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    console.error("[webhook] Supabase update failed for order:", orderId, error);
    throw new Error(`Supabase update failed: ${error.message}`);
  }

  console.log(`[webhook] Order ${orderId} marked as paid`);
}

/**
 * Handles a failed payment intent.
 * Updates the order status to 'payment_failed' and logs the failure reason.
 *
 * @param {Stripe.PaymentIntent} paymentIntent
 */
async function handlePaymentFailed(paymentIntent) {
  const { orderId } = paymentIntent.metadata || {};
  const failureMessage =
    paymentIntent.last_payment_error?.message || "Unknown payment failure";

  console.error(
    `[webhook] Payment failed${orderId ? ` for order ${orderId}` : ""}:`,
    failureMessage
  );

  if (!orderId) {
    // No order to update — just log
    return;
  }

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("orders")
    .update({
      status: "payment_failed",
      payment_status: "failed",
      payment_failure_reason: failureMessage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    console.error("[webhook] Supabase update failed for order:", orderId, error);
  }
}
