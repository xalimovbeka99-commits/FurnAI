/**
 * @fileoverview Resend Email Service for FurnAI.
 *
 * Provides pre-built email senders for order confirmations, design sharing
 * notifications, and order status updates. Uses the Resend SDK with
 * plain HTML templates.
 *
 * @requires process.env.RESEND_API_KEY — Resend API key
 *
 * @example
 *   import { sendOrderConfirmation } from '@/lib/email'
 *
 *   await sendOrderConfirmation({
 *     to: 'customer@example.com',
 *     orderNumber: 'ORD-20260101-001',
 *     designName: 'Modern Oak Dining Table',
 *     totalPrice: '$299.00',
 *     estimatedDelivery: 'June 25, 2026',
 *   })
 */

import { Resend } from 'resend'

/**
 * Pre-configured Resend client instance.
 * @type {Resend}
 */
const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Default sender address for all FurnAI transactional emails.
 * @type {string}
 */
const FROM_ADDRESS = 'FurnAI <orders@furnai.com>'

// ─────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────

/**
 * Sends an email via Resend with error handling.
 *
 * @param {object} params
 * @param {string}        params.to      — Recipient email
 * @param {string}        params.subject — Email subject
 * @param {string}        params.html    — HTML body content
 * @param {string}        [params.from]  — Override sender address
 * @returns {Promise<{ id: string }>} Resend email ID
 * @throws {Error} On missing API key or Resend API failure
 */
async function sendEmail({ to, subject, html, from = FROM_ADDRESS }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('[Email] RESEND_API_KEY environment variable is not set.')
  }
  if (!to || !subject) {
    throw new Error('[Email] "to" and "subject" are required.')
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    })

    if (error) {
      throw new Error(`[Email] Resend API error: ${error.message}`)
    }

    return { id: data.id }
  } catch (err) {
    if (err.message?.startsWith('[Email]')) throw err
    throw new Error(`[Email] Failed to send email: ${err.message}`)
  }
}

/**
 * Wraps email body content in a consistent branded layout.
 * @param {string} content — Inner HTML content
 * @returns {string} Full HTML email
 */
function wrapInLayout(content) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f4f4f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:32px;margin-bottom:32px;">
    <tr>
      <td style="background:linear-gradient(135deg,#1e293b,#334155);padding:28px 32px;">
        <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">FurnAI</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        ${content}
      </td>
    </tr>
    <tr>
      <td style="padding:16px 32px;background:#f8fafc;color:#94a3b8;font-size:12px;text-align:center;">
        <p style="margin:0;">&copy; ${new Date().getFullYear()} FurnAI. All rights reserved.</p>
        <p style="margin:4px 0 0;">AI-Powered Furniture Design Platform</p>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

/**
 * Sends an order confirmation email to the customer.
 *
 * @param {object} params
 * @param {string} params.to                 — Customer email address
 * @param {string} params.orderNumber        — Order reference number
 * @param {string} params.designName         — Name of the furniture design
 * @param {string} params.totalPrice         — Formatted total price (e.g., "$299.00")
 * @param {string} params.estimatedDelivery  — Estimated delivery date string
 * @returns {Promise<{ id: string }>} Resend email ID
 *
 * @example
 *   await sendOrderConfirmation({
 *     to: 'john@example.com',
 *     orderNumber: 'ORD-001',
 *     designName: 'Modern Oak Dining Table',
 *     totalPrice: '$299.00',
 *     estimatedDelivery: 'June 25, 2026',
 *   })
 */
export async function sendOrderConfirmation({
  to,
  orderNumber,
  designName,
  totalPrice,
  estimatedDelivery,
}) {
  if (!to || !orderNumber || !designName || !totalPrice) {
    throw new Error('[Email] sendOrderConfirmation: to, orderNumber, designName, and totalPrice are required.')
  }

  const html = wrapInLayout(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;">Order Confirmed! 🎉</h2>
    <p style="color:#475569;margin:0 0 24px;">Thank you for your order. Here are the details:</p>
    <table role="presentation" width="100%" style="border-collapse:collapse;">
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;">Order Number</td>
        <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;color:#1e293b;font-weight:600;text-align:right;font-size:14px;">${orderNumber}</td>
      </tr>
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;">Design</td>
        <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;color:#1e293b;font-weight:600;text-align:right;font-size:14px;">${designName}</td>
      </tr>
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:14px;">Total</td>
        <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;color:#1e293b;font-weight:600;text-align:right;font-size:14px;">${totalPrice}</td>
      </tr>
      ${estimatedDelivery ? `
      <tr>
        <td style="padding:12px 0;color:#64748b;font-size:14px;">Est. Delivery</td>
        <td style="padding:12px 0;color:#1e293b;font-weight:600;text-align:right;font-size:14px;">${estimatedDelivery}</td>
      </tr>` : ''}
    </table>
    <p style="color:#475569;font-size:14px;margin:24px 0 0;">We'll send you updates as your order progresses.</p>
  `)

  return sendEmail({
    to,
    subject: `Order Confirmed — ${orderNumber}`,
    html,
  })
}

/**
 * Sends a design-shared notification email to the recipient.
 *
 * @param {object} params
 * @param {string} params.to         — Recipient email address
 * @param {string} params.fromName   — Name of the person sharing
 * @param {string} params.designName — Name of the shared design
 * @param {string} params.designUrl  — URL to view the shared design
 * @returns {Promise<{ id: string }>} Resend email ID
 *
 * @example
 *   await sendDesignShared({
 *     to: 'colleague@example.com',
 *     fromName: 'Alice',
 *     designName: 'Scandinavian Bookshelf',
 *     designUrl: 'https://furnai.com/designs/abc123',
 *   })
 */
export async function sendDesignShared({ to, fromName, designName, designUrl }) {
  if (!to || !fromName || !designName || !designUrl) {
    throw new Error('[Email] sendDesignShared: to, fromName, designName, and designUrl are required.')
  }

  const html = wrapInLayout(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;">A Design Was Shared With You ✨</h2>
    <p style="color:#475569;margin:0 0 24px;font-size:14px;">
      <strong>${fromName}</strong> shared a furniture design with you on FurnAI.
    </p>
    <div style="background:#f8fafc;border-radius:8px;padding:20px;margin:0 0 24px;">
      <p style="margin:0;color:#1e293b;font-size:16px;font-weight:600;">${designName}</p>
    </div>
    <a href="${designUrl}" style="display:inline-block;background:#1e293b;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">
      View Design
    </a>
    <p style="color:#94a3b8;font-size:12px;margin:24px 0 0;">
      If the button doesn't work, copy and paste this link: ${designUrl}
    </p>
  `)

  return sendEmail({
    to,
    subject: `${fromName} shared "${designName}" with you on FurnAI`,
    html,
  })
}

/**
 * Sends an order status update email to the customer.
 *
 * @param {object} params
 * @param {string} params.to          — Customer email address
 * @param {string} params.orderNumber — Order reference number
 * @param {string} params.status      — New status (e.g., 'in_production', 'shipped', 'delivered')
 * @param {string} [params.message]   — Optional extra detail message
 * @returns {Promise<{ id: string }>} Resend email ID
 *
 * @example
 *   await sendStatusUpdate({
 *     to: 'john@example.com',
 *     orderNumber: 'ORD-001',
 *     status: 'shipped',
 *     message: 'Your order is on its way! Tracking number: TRK123456',
 *   })
 */
export async function sendStatusUpdate({ to, orderNumber, status, message }) {
  if (!to || !orderNumber || !status) {
    throw new Error('[Email] sendStatusUpdate: to, orderNumber, and status are required.')
  }

  /** @type {Record<string, { label: string, emoji: string, color: string }>} */
  const statusConfig = {
    pending:        { label: 'Pending',         emoji: '⏳', color: '#f59e0b' },
    confirmed:      { label: 'Confirmed',       emoji: '✅', color: '#22c55e' },
    in_production:  { label: 'In Production',   emoji: '🔨', color: '#3b82f6' },
    quality_check:  { label: 'Quality Check',   emoji: '🔍', color: '#8b5cf6' },
    shipped:        { label: 'Shipped',         emoji: '🚚', color: '#06b6d4' },
    delivered:      { label: 'Delivered',       emoji: '📦', color: '#22c55e' },
    cancelled:      { label: 'Cancelled',       emoji: '❌', color: '#ef4444' },
  }

  const config = statusConfig[status] || { label: status, emoji: 'ℹ️', color: '#64748b' }

  const html = wrapInLayout(`
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;">Order Update ${config.emoji}</h2>
    <p style="color:#475569;margin:0 0 24px;font-size:14px;">
      Your order <strong>${orderNumber}</strong> has a new status:
    </p>
    <div style="background:#f8fafc;border-radius:8px;padding:16px 20px;border-left:4px solid ${config.color};margin:0 0 24px;">
      <p style="margin:0;color:${config.color};font-size:18px;font-weight:700;">${config.label}</p>
    </div>
    ${message ? `<p style="color:#475569;font-size:14px;margin:0 0 24px;">${message}</p>` : ''}
    <p style="color:#94a3b8;font-size:12px;margin:0;">
      If you have questions, reply to this email and our team will help you.
    </p>
  `)

  return sendEmail({
    to,
    subject: `Order ${orderNumber} — ${config.label}`,
    html,
  })
}
