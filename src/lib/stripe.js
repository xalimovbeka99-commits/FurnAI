/**
 * @fileoverview Stripe Payment Service for FurnAI.
 *
 * Provides a pre-configured Stripe SDK instance and helper functions
 * for creating Checkout Sessions and verifying webhook signatures.
 *
 * @requires process.env.STRIPE_SECRET_KEY        — Stripe secret key
 * @requires process.env.STRIPE_WEBHOOK_SECRET     — Stripe webhook endpoint secret
 *
 * @example
 *   import { createCheckoutSession } from '@/lib/stripe'
 *
 *   const session = await createCheckoutSession({
 *     designId: 'design_abc',
 *     orderId: 'order_123',
 *     amount: 29900,
 *     currency: 'usd',
 *     successUrl: 'https://furnai.com/order/success?session_id={CHECKOUT_SESSION_ID}',
 *     cancelUrl: 'https://furnai.com/order/cancel',
 *   })
 */

import Stripe from 'stripe'

/**
 * Pre-configured Stripe SDK instance.
 * Uses the latest API version and identifies requests as coming from FurnAI.
 *
 * @type {Stripe}
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-04-30.basil',
  appInfo: {
    name: 'FurnAI',
    version: '0.1.0',
    url: 'https://furnai.com',
  },
})

// ─────────────────────────────────────────────
// Checkout Session
// ─────────────────────────────────────────────

/**
 * Creates a Stripe Checkout Session for a furniture design order.
 *
 * @param {object} params
 * @param {string} params.designId   — Internal design ID (stored in metadata)
 * @param {string} params.orderId    — Internal order ID (stored in metadata)
 * @param {number} params.amount     — Price in the smallest currency unit (e.g., cents)
 * @param {string} [params.currency='usd'] — Three-letter ISO currency code
 * @param {string} params.successUrl — URL to redirect on successful payment
 *   (use `{CHECKOUT_SESSION_ID}` placeholder for the session ID)
 * @param {string} params.cancelUrl  — URL to redirect on cancellation
 * @param {string} [params.customerEmail] — Pre-fill the customer email
 * @param {string} [params.designName]    — Product name shown on checkout page
 * @returns {Promise<Stripe.Checkout.Session>} The created Checkout Session
 * @throws {Error} On missing parameters or Stripe API failure
 *
 * @example
 *   const session = await createCheckoutSession({
 *     designId: 'dsgn_001',
 *     orderId: 'ord_001',
 *     amount: 15000,
 *     successUrl: 'https://furnai.com/success?session_id={CHECKOUT_SESSION_ID}',
 *     cancelUrl: 'https://furnai.com/cancel',
 *   })
 *   // Redirect user to session.url
 */
export async function createCheckoutSession({
  designId,
  orderId,
  amount,
  currency = 'usd',
  successUrl,
  cancelUrl,
  customerEmail,
  designName,
}) {
  if (!designId || !orderId) {
    throw new Error('[Stripe] designId and orderId are required.')
  }
  if (!amount || amount <= 0) {
    throw new Error('[Stripe] amount must be a positive integer (in smallest currency unit).')
  }
  if (!successUrl || !cancelUrl) {
    throw new Error('[Stripe] successUrl and cancelUrl are required.')
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: amount,
            product_data: {
              name: designName || `FurnAI Design — ${designId}`,
              description: `Order ${orderId}`,
              metadata: { designId, orderId },
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        designId,
        orderId,
      },
      ...(customerEmail && { customer_email: customerEmail }),
      success_url: successUrl,
      cancel_url: cancelUrl,
    })

    return session
  } catch (err) {
    throw new Error(`[Stripe] Failed to create checkout session: ${err.message}`)
  }
}

// ─────────────────────────────────────────────
// Webhook verification
// ─────────────────────────────────────────────

/**
 * Constructs and verifies a Stripe webhook event from a raw request body
 * and the `Stripe-Signature` header.
 *
 * @param {string | Buffer} body       — Raw request body (must NOT be parsed as JSON)
 * @param {string}          signature  — Value of the `stripe-signature` header
 * @returns {Stripe.Event} The verified Stripe event
 * @throws {Error} If the signature is invalid or the webhook secret is missing
 *
 * @example
 *   // In a Next.js App Router API route (route.js):
 *   import { constructWebhookEvent } from '@/lib/stripe'
 *
 *   export async function POST(request) {
 *     const body = await request.text()
 *     const signature = request.headers.get('stripe-signature')
 *     const event = constructWebhookEvent(body, signature)
 *     // handle event.type ...
 *   }
 */
export function constructWebhookEvent(body, signature) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    throw new Error('[Stripe] STRIPE_WEBHOOK_SECRET environment variable is not set.')
  }
  if (!signature) {
    throw new Error('[Stripe] Missing stripe-signature header.')
  }

  try {
    return stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    throw new Error(`[Stripe] Webhook signature verification failed: ${err.message}`)
  }
}
