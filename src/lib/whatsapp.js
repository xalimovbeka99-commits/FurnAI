/**
 * @fileoverview WhatsApp Cloud API Notification Service for FurnAI.
 *
 * Sends WhatsApp messages via the Meta Graph API for factory order
 * notifications and customer order status updates using approved
 * message templates.
 *
 * @requires process.env.WHATSAPP_PHONE_ID — WhatsApp Business phone number ID
 * @requires process.env.WHATSAPP_TOKEN    — Meta Graph API access token
 * @requires process.env.WHATSAPP_FACTORY_PHONE — Factory phone number (with country code, e.g., "+998901234567")
 *
 * @example
 *   import { sendOrderToFactory, sendStatusUpdate } from '@/lib/whatsapp'
 *
 *   await sendOrderToFactory({
 *     orderNumber: 'ORD-001',
 *     designType: 'wardrobe',
 *     dimensions: '120×220×60 cm',
 *     materials: 'Oak wood, matte finish',
 *     customerName: 'John Doe',
 *   })
 */

const GRAPH_API_VERSION = 'v22.0'

/**
 * Maximum number of retry attempts for transient failures.
 * @type {number}
 */
const MAX_RETRIES = 2

/**
 * Base delay in ms between retries.
 * @type {number}
 */
const RETRY_DELAY_MS = 1000

// ─────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────

/**
 * Returns the Graph API messages endpoint URL.
 * @returns {string}
 */
function getMessagesUrl() {
  const phoneId = process.env.WHATSAPP_PHONE_ID
  if (!phoneId) {
    throw new Error('[WhatsApp] WHATSAPP_PHONE_ID environment variable is not set.')
  }
  return `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneId}/messages`
}

/**
 * Returns default headers for the Graph API.
 * @returns {Record<string, string>}
 */
function getHeaders() {
  const token = process.env.WHATSAPP_TOKEN
  if (!token) {
    throw new Error('[WhatsApp] WHATSAPP_TOKEN environment variable is not set.')
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

/**
 * Sleeps for the given number of milliseconds.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Sends a message payload to the WhatsApp Cloud API with retry logic.
 *
 * @param {object} payload — Complete message payload
 * @returns {Promise<{ messageId: string }>} The sent message ID
 * @throws {Error} On API failure after all retries
 */
async function sendMessage(payload) {
  const url = getMessagesUrl()
  const headers = getHeaders()
  let lastError

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      // Rate limited
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10)
        await sleep(retryAfter * 1000)
        continue
      }

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}))
        const errMsg = errorBody?.error?.message || `HTTP ${response.status}`
        lastError = new Error(`[WhatsApp] API error: ${errMsg}`)

        // Retry on server errors only
        if (response.status >= 500) {
          await sleep(RETRY_DELAY_MS * Math.pow(2, attempt))
          continue
        }
        throw lastError
      }

      const data = await response.json()
      return { messageId: data.messages?.[0]?.id || data.messages?.[0]?.message_id }
    } catch (err) {
      if (err.message?.startsWith('[WhatsApp]')) throw err
      lastError = err
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * Math.pow(2, attempt))
      }
    }
  }

  throw lastError || new Error('[WhatsApp] Failed to send message after retries.')
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

/**
 * Sends a new order notification to the factory via WhatsApp.
 *
 * Uses the `factory_order_notification` template. If your WhatsApp Business
 * account has a different template name, update the `template.name` field.
 *
 * @param {object} params
 * @param {string} params.orderNumber   — Order reference number
 * @param {string} params.designType    — Furniture type (e.g., 'wardrobe', 'table')
 * @param {string} params.dimensions    — Dimensions string (e.g., '120×220×60 cm')
 * @param {string} params.materials     — Materials description
 * @param {string} params.customerName  — Customer's name
 * @param {string} [params.factoryPhone] — Override factory phone number
 * @returns {Promise<{ messageId: string }>} Sent message ID
 * @throws {Error} On missing parameters or API failure
 *
 * @example
 *   await sendOrderToFactory({
 *     orderNumber: 'ORD-20260611-001',
 *     designType: 'wardrobe',
 *     dimensions: '120×220×60 cm',
 *     materials: 'Oak wood, matte finish',
 *     customerName: 'John Doe',
 *   })
 */
export async function sendOrderToFactory({
  orderNumber,
  designType,
  dimensions,
  materials,
  customerName,
  factoryPhone,
}) {
  if (!orderNumber || !designType || !dimensions || !materials || !customerName) {
    throw new Error(
      '[WhatsApp] sendOrderToFactory: orderNumber, designType, dimensions, materials, and customerName are required.'
    )
  }

  const phoneNumber = factoryPhone || process.env.WHATSAPP_FACTORY_PHONE || process.env.WHATSAPP_FACTORY_NUMBER
  if (!phoneNumber) {
    throw new Error('[WhatsApp] WHATSAPP_FACTORY_PHONE or WHATSAPP_FACTORY_NUMBER environment variable is not set and no factoryPhone provided.')
  }

  const payload = {
    messaging_product: 'whatsapp',
    to: phoneNumber,
    type: 'template',
    template: {
      name: 'factory_order_notification',
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: orderNumber },
            { type: 'text', text: designType },
            { type: 'text', text: dimensions },
            { type: 'text', text: materials },
            { type: 'text', text: customerName },
          ],
        },
      ],
    },
  }

  return sendMessage(payload)
}

/**
 * Sends an order status update to a customer via WhatsApp.
 *
 * Uses the `order_status_update` template. Adjust the template name
 * to match your approved WhatsApp Business template.
 *
 * @param {object} params
 * @param {string} params.phoneNumber — Customer phone number (with country code, e.g., "+998901234567")
 * @param {string} params.orderNumber — Order reference number
 * @param {string} params.status      — New status label (e.g., 'In Production', 'Shipped', 'Delivered')
 * @param {string} [params.message]   — Optional extra detail message
 * @returns {Promise<{ messageId: string }>} Sent message ID
 * @throws {Error} On missing parameters or API failure
 *
 * @example
 *   await sendStatusUpdate({
 *     phoneNumber: '+998901234567',
 *     orderNumber: 'ORD-001',
 *     status: 'Shipped',
 *     message: 'Tracking: TRK123456',
 *   })
 */
export async function sendStatusUpdate({ phoneNumber, orderNumber, status, message }) {
  if (!phoneNumber || !orderNumber || !status) {
    throw new Error('[WhatsApp] sendStatusUpdate: phoneNumber, orderNumber, and status are required.')
  }

  const payload = {
    messaging_product: 'whatsapp',
    to: phoneNumber,
    type: 'template',
    template: {
      name: 'order_status_update',
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: orderNumber },
            { type: 'text', text: status },
            ...(message ? [{ type: 'text', text: message }] : []),
          ],
        },
      ],
    },
  }

  return sendMessage(payload)
}

/**
 * Sends a freeform text message to a WhatsApp number.
 * Note: This requires the recipient to have messaged your business
 * within the last 24 hours (WhatsApp Business Policy).
 *
 * @param {string} phoneNumber — Recipient phone number (with country code)
 * @param {string} text        — Message body text
 * @returns {Promise<{ messageId: string }>} Sent message ID
 *
 * @example
 *   await sendTextMessage('+998901234567', 'Your custom furniture is ready for pickup!')
 */
export async function sendTextMessage(phoneNumber, text) {
  if (!phoneNumber || !text) {
    throw new Error('[WhatsApp] phoneNumber and text are required.')
  }

  const payload = {
    messaging_product: 'whatsapp',
    to: phoneNumber,
    type: 'text',
    text: { body: text },
  }

  return sendMessage(payload)
}
