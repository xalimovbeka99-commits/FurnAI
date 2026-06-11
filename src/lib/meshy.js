/**
 * @fileoverview Meshy AI 3D Generation Service for FurnAI.
 *
 * Provides a complete client for the Meshy API v2, supporting text-to-3D
 * and image-to-3D generation workflows with automatic polling and retries.
 *
 * @requires process.env.MESHY_API_KEY — Meshy API bearer token
 *
 * @example
 *   import { textTo3D, waitForCompletion } from '@/lib/meshy'
 *
 *   const { taskId } = await textTo3D('modern oak dining table', 'realistic')
 *   const result = await waitForCompletion(taskId)
 *   console.log(result.modelUrls)
 */

const BASE_URL = 'https://api.meshy.ai/openapi/v2'

/**
 * Maximum number of retry attempts for transient failures (5xx, network).
 * @type {number}
 */
const MAX_RETRIES = 3

/**
 * Base delay in ms between retries (doubled on each attempt).
 * @type {number}
 */
const RETRY_BASE_DELAY_MS = 1000

// ─────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────

/**
 * Returns default headers for Meshy API requests.
 * @returns {Record<string, string>}
 */
function getHeaders() {
  const apiKey = process.env.MESHY_API_KEY
  if (!apiKey) {
    throw new Error('[Meshy] MESHY_API_KEY environment variable is not set.')
  }
  return {
    Authorization: `Bearer ${apiKey}`,
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
 * Makes an HTTP request to the Meshy API with automatic retries on
 * transient errors (HTTP 429, 5xx, and network failures).
 *
 * @param {string} path  — API path relative to BASE_URL (e.g. '/text-to-3d')
 * @param {object} options — fetch options (method, body, etc.)
 * @returns {Promise<any>} Parsed JSON response
 * @throws {Error} On non-retryable errors or after all retries exhausted
 */
async function meshyFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const headers = getHeaders()
  let lastError

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, { ...options, headers })

      // Rate-limited — respect Retry-After if provided
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10)
        await sleep(retryAfter * 1000)
        continue
      }

      // Server errors — retry with backoff
      if (response.status >= 500) {
        lastError = new Error(`[Meshy] Server error ${response.status} on ${path}`)
        await sleep(RETRY_BASE_DELAY_MS * Math.pow(2, attempt))
        continue
      }

      // Client errors — fail immediately
      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Unknown error')
        throw new Error(`[Meshy] HTTP ${response.status}: ${errorBody}`)
      }

      return await response.json()
    } catch (err) {
      // Network errors (DNS, timeout, etc.) — retry with backoff
      if (err.name === 'TypeError' || err.code === 'ECONNRESET') {
        lastError = err
        await sleep(RETRY_BASE_DELAY_MS * Math.pow(2, attempt))
        continue
      }
      throw err
    }
  }

  throw lastError || new Error(`[Meshy] Request to ${path} failed after ${MAX_RETRIES} retries.`)
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

/**
 * Creates a text-to-3D generation task.
 *
 * @param {string} prompt    — Description of the 3D model to generate
 * @param {string} [artStyle='realistic'] — Art style preset
 *   ('realistic', 'cartoon', 'low-poly', 'sculpture', 'pbr')
 * @param {object} [options] — Additional task options
 * @param {string} [options.negativePrompt] — What to avoid in the generation
 * @param {string} [options.topology]       — Target mesh topology ('quad', 'triangle')
 * @param {number} [options.targetPolycount] — Target polygon count
 * @returns {Promise<{ taskId: string }>} The created task ID
 *
 * @example
 *   const { taskId } = await textTo3D('minimalist wooden chair', 'realistic')
 */
export async function textTo3D(prompt, artStyle = 'realistic', options = {}) {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('[Meshy] prompt is required and must be a non-empty string.')
  }

  const body = {
    mode: 'preview',
    prompt,
    art_style: artStyle,
    ...(options.negativePrompt && { negative_prompt: options.negativePrompt }),
    ...(options.topology && { topology: options.topology }),
    ...(options.targetPolycount && { target_polycount: options.targetPolycount }),
  }

  const data = await meshyFetch('/text-to-3d', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  return { taskId: data.result }
}

/**
 * Creates an image-to-3D generation task from an image URL.
 *
 * @param {string} imageUrl — Publicly accessible URL of the source image
 * @param {object} [options] — Additional task options
 * @param {string} [options.topology]        — Target mesh topology
 * @param {number} [options.targetPolycount]  — Target polygon count
 * @returns {Promise<{ taskId: string }>} The created task ID
 *
 * @example
 *   const { taskId } = await imageTo3D('https://example.com/chair.png')
 */
export async function imageTo3D(imageUrl, options = {}) {
  if (!imageUrl || typeof imageUrl !== 'string') {
    throw new Error('[Meshy] imageUrl is required and must be a non-empty string.')
  }

  const body = {
    image_url: imageUrl,
    ...(options.topology && { topology: options.topology }),
    ...(options.targetPolycount && { target_polycount: options.targetPolycount }),
  }

  const data = await meshyFetch('/image-to-3d', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  return { taskId: data.result }
}

/**
 * Retrieves the current status and result of a generation task.
 *
 * @param {string} taskId — The task ID returned by textTo3D or imageTo3D
 * @returns {Promise<MeshyTaskStatus>} Current task status and data
 *
 * @typedef {object} MeshyTaskStatus
 * @property {string}  id          — Task ID
 * @property {string}  status      — 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED' | 'EXPIRED'
 * @property {number}  progress    — Completion percentage (0–100)
 * @property {string}  [model_urls.glb]  — URL to the GLB model file
 * @property {string}  [model_urls.fbx]  — URL to the FBX model file
 * @property {string}  [model_urls.obj]  — URL to the OBJ model file
 * @property {string}  [model_urls.usdz] — URL to the USDZ model file
 * @property {string}  [thumbnail_url]   — URL to a preview thumbnail
 * @property {string}  [texture_urls]    — URLs to texture maps
 * @property {number}  created_at  — Unix timestamp of creation
 * @property {string}  [error]     — Error message if task failed
 */
export async function getTaskStatus(taskId) {
  if (!taskId) {
    throw new Error('[Meshy] taskId is required.')
  }

  return await meshyFetch(`/text-to-3d/${taskId}`, { method: 'GET' })
}

/**
 * Polls a task until it reaches a terminal state (SUCCEEDED or FAILED).
 *
 * @param {string} taskId                — The task ID to monitor
 * @param {number} [pollInterval=5000]   — Milliseconds between status checks
 * @param {number} [timeout=600000]      — Maximum wait time in ms (default 10 min)
 * @returns {Promise<MeshyTaskStatus>} The completed task data with model URLs
 * @throws {Error} If the task fails or the timeout is exceeded
 *
 * @example
 *   const result = await waitForCompletion(taskId, 3000, 300000)
 *   console.log(result.model_urls.glb) // download URL
 */
export async function waitForCompletion(taskId, pollInterval = 5000, timeout = 600000) {
  if (!taskId) {
    throw new Error('[Meshy] taskId is required.')
  }

  const startTime = Date.now()

  while (true) {
    const task = await getTaskStatus(taskId)

    if (task.status === 'SUCCEEDED') {
      return task
    }

    if (task.status === 'FAILED') {
      throw new Error(
        `[Meshy] Task ${taskId} failed: ${task.error || 'Unknown error'}`
      )
    }

    if (task.status === 'EXPIRED') {
      throw new Error(`[Meshy] Task ${taskId} has expired.`)
    }

    if (Date.now() - startTime > timeout) {
      throw new Error(
        `[Meshy] Task ${taskId} timed out after ${timeout / 1000}s (last status: ${task.status}, progress: ${task.progress}%).`
      )
    }

    await sleep(pollInterval)
  }
}
