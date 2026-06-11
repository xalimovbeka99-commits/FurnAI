/**
 * @fileoverview Stripe Checkout Session Creation Route
 *
 * POST /api/payments/checkout
 *   Creates a Stripe Checkout session for a FurnAI design order.
 *
 *   Body: {
 *     designId: string,       — ID of the design being purchased
 *     orderId: string,        — Internal order reference
 *     amount: number,         — Amount in the smallest currency unit (e.g. fils for AED)
 *     currency?: string,      — ISO currency code (default: 'aed')
 *     customerEmail?: string  — Pre-fill checkout email
 *   }
 *
 *   Returns: { sessionId: string, sessionUrl: string }
 */

import { NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * Lazily initialised Stripe instance.
 * @type {Stripe | null}
 */
let stripeInstance = null;

/**
 * Returns a cached Stripe SDK instance.
 * @returns {Stripe}
 */
function getStripe() {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
    stripeInstance = new Stripe(key, { apiVersion: "2024-12-18.acacia" });
  }
  return stripeInstance;
}

/**
 * POST /api/payments/checkout
 *
 * @param {Request} request
 * @returns {Promise<NextResponse>}
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { designId, orderId, amount, currency, customerEmail } = body;

    // ── Validate required fields ─────────────────────────────────────
    if (!designId || !orderId) {
      return NextResponse.json(
        { error: "Both 'designId' and 'orderId' are required" },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "'amount' must be a positive number (in smallest currency unit)" },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const currencyCode = (currency || "aed").toLowerCase();

    // ── Build success and cancel URLs ────────────────────────────────
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.headers.get("origin") ||
      "http://localhost:3000";

    const successUrl = `${origin}/orders/${orderId}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/orders/${orderId}/cancel`;

    // ── Create Checkout Session ──────────────────────────────────────
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      ...(customerEmail && { customer_email: customerEmail }),
      line_items: [
        {
          price_data: {
            currency: currencyCode,
            product_data: {
              name: `FurnAI Design Order — ${orderId}`,
              description: `Custom furniture design #${designId}`,
              metadata: { designId, orderId },
            },
            unit_amount: Math.round(amount),
          },
          quantity: 1,
        },
      ],
      metadata: {
        designId,
        orderId,
        source: "furnai",
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({
      sessionId: session.id,
      sessionUrl: session.url,
    });
  } catch (err) {
    console.error("[payments/checkout] Error:", err);

    // Surface Stripe-specific errors
    if (err.type === "StripeInvalidRequestError") {
      return NextResponse.json(
        { error: "Invalid payment request", detail: err.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create checkout session", detail: err.message },
      { status: 500 }
    );
  }
}
