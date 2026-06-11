/**
 * @fileoverview Cloudinary Upload & Transformation Utility for FurnAI.
 *
 * Handles image and 3D model uploads to Cloudinary, and generates
 * optimized/transformed URLs for serving assets. Uses the Cloudinary
 * REST Upload API directly (no SDK dependency needed).
 *
 * @requires process.env.CLOUDINARY_CLOUD_NAME — Cloudinary cloud name
 * @requires process.env.CLOUDINARY_API_KEY    — Cloudinary API key
 * @requires process.env.CLOUDINARY_API_SECRET — Cloudinary API secret
 *
 * @example
 *   import { uploadImage, getOptimizedUrl } from '@/lib/cloudinary'
 *
 *   const result = await uploadImage(file, 'designs/thumbnails')
 *   const optimizedUrl = getOptimizedUrl(result.publicId, { width: 400, quality: 'auto' })
 */

import { createHash } from 'crypto'

/**
 * Cloudinary Upload API base URL.
 * @type {string}
 */
const UPLOAD_URL = 'https://api.cloudinary.com/v1_1'

// ─────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────

/**
 * Returns validated Cloudinary configuration from environment variables.
 * @returns {{ cloudName: string, apiKey: string, apiSecret: string }}
 * @throws {Error} If any required env var is missing
 */
function getConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      '[Cloudinary] Missing environment variables. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
    )
  }

  return { cloudName, apiKey, apiSecret }
}

/**
 * Generates a SHA-1 signature for Cloudinary upload authentication.
 *
 * @param {Record<string, string>} params — Parameters to sign
 * @param {string} apiSecret — Cloudinary API secret
 * @returns {string} Hex-encoded SHA-1 signature
 */
function generateSignature(params, apiSecret) {
  const sortedKeys = Object.keys(params).sort()
  const stringToSign = sortedKeys
    .map((key) => `${key}=${params[key]}`)
    .join('&')
  return createHash('sha1').update(stringToSign + apiSecret).digest('hex')
}

/**
 * Uploads a file to Cloudinary via the Upload API.
 *
 * @param {string | Buffer | ReadableStream} file — File URL, base64 data URI, or Buffer
 * @param {string} folder          — Cloudinary folder path
 * @param {string} resourceType    — Cloudinary resource type ('image', 'raw', 'video', 'auto')
 * @param {object} [extraParams]   — Additional upload parameters
 * @returns {Promise<CloudinaryUploadResult>} Upload result with URLs and metadata
 *
 * @typedef {object} CloudinaryUploadResult
 * @property {string} publicId    — Cloudinary public ID
 * @property {string} secureUrl   — HTTPS URL of the uploaded asset
 * @property {string} url         — HTTP URL of the uploaded asset
 * @property {string} format      — File format (e.g., 'png', 'glb')
 * @property {number} bytes       — File size in bytes
 * @property {number} width       — Image width (0 for non-image assets)
 * @property {number} height      — Image height (0 for non-image assets)
 * @property {string} resourceType — Resource type
 * @property {string} createdAt   — ISO timestamp of upload
 */
async function upload(file, folder, resourceType, extraParams = {}) {
  const { cloudName, apiKey, apiSecret } = getConfig()
  const timestamp = Math.floor(Date.now() / 1000).toString()

  const params = {
    folder,
    timestamp,
    ...extraParams,
  }

  const signature = generateSignature(params, apiSecret)

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', apiKey)
  formData.append('signature', signature)
  formData.append('timestamp', timestamp)
  formData.append('folder', folder)

  // Append extra params to form
  for (const [key, value] of Object.entries(extraParams)) {
    formData.append(key, value)
  }

  const response = await fetch(
    `${UPLOAD_URL}/${cloudName}/${resourceType}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(
      `[Cloudinary] Upload failed (${response.status}): ${errorBody?.error?.message || 'Unknown error'}`
    )
  }

  const data = await response.json()

  return {
    publicId: data.public_id,
    secureUrl: data.secure_url,
    url: data.url,
    format: data.format,
    bytes: data.bytes,
    width: data.width || 0,
    height: data.height || 0,
    resourceType: data.resource_type,
    createdAt: data.created_at,
  }
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

/**
 * Uploads an image to Cloudinary.
 *
 * @param {string | Buffer} file   — Image file as a URL, base64 data URI, or Buffer
 * @param {string} [folder='furnai/images'] — Cloudinary folder path
 * @param {object} [options]       — Additional upload options
 * @param {string} [options.publicId]       — Custom public ID
 * @param {string} [options.transformation] — Eager transformation string
 * @param {boolean} [options.overwrite]     — Whether to overwrite existing asset
 * @returns {Promise<CloudinaryUploadResult>} Upload result
 *
 * @example
 *   const result = await uploadImage(
 *     'https://example.com/photo.jpg',
 *     'furnai/designs/thumbnails'
 *   )
 *   console.log(result.secureUrl)
 */
export async function uploadImage(file, folder = 'furnai/images', options = {}) {
  if (!file) {
    throw new Error('[Cloudinary] file is required for uploadImage.')
  }

  const extraParams = {}
  if (options.publicId) extraParams.public_id = options.publicId
  if (options.transformation) extraParams.eager = options.transformation
  if (options.overwrite) extraParams.overwrite = 'true'

  return upload(file, folder, 'image', extraParams)
}

/**
 * Uploads a 3D model file to Cloudinary.
 *
 * 3D models (.glb, .gltf, .obj, .fbx, .usdz) are uploaded as 'raw'
 * resource type since Cloudinary doesn't natively process 3D files
 * as images or videos.
 *
 * @param {string | Buffer} file   — Model file as a URL, base64 data URI, or Buffer
 * @param {string} [folder='furnai/models'] — Cloudinary folder path
 * @param {object} [options]       — Additional upload options
 * @param {string} [options.publicId]   — Custom public ID
 * @param {boolean} [options.overwrite] — Whether to overwrite existing asset
 * @returns {Promise<CloudinaryUploadResult>} Upload result
 *
 * @example
 *   const result = await uploadModel(modelBuffer, 'furnai/models/chairs')
 */
export async function uploadModel(file, folder = 'furnai/models', options = {}) {
  if (!file) {
    throw new Error('[Cloudinary] file is required for uploadModel.')
  }

  const extraParams = {}
  if (options.publicId) extraParams.public_id = options.publicId
  if (options.overwrite) extraParams.overwrite = 'true'

  return upload(file, folder, 'raw', extraParams)
}

/**
 * Generates an optimized/transformed Cloudinary URL for an image.
 *
 * @param {string} publicId — Cloudinary public ID of the image
 * @param {object} [options]
 * @param {number}  [options.width]    — Target width in pixels
 * @param {number}  [options.height]   — Target height in pixels
 * @param {string}  [options.crop='fill'] — Crop mode ('fill', 'fit', 'scale', 'thumb', 'pad')
 * @param {string}  [options.quality='auto'] — Quality setting ('auto', 'auto:low', 'auto:best', or 1-100)
 * @param {string}  [options.format='auto']  — Output format ('auto', 'webp', 'avif', 'png', 'jpg')
 * @param {string}  [options.gravity]  — Gravity for cropping ('auto', 'face', 'center')
 * @param {string}  [options.effect]   — Effect to apply (e.g., 'blur:200', 'sharpen')
 * @returns {string} Fully-qualified optimized image URL
 *
 * @example
 *   const url = getOptimizedUrl('furnai/designs/thumbnails/chair_001', {
 *     width: 400,
 *     height: 300,
 *     crop: 'fill',
 *     quality: 'auto',
 *     format: 'webp',
 *   })
 */
export function getOptimizedUrl(publicId, options = {}) {
  const { cloudName } = getConfig()

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
    gravity,
    effect,
  } = options

  const transforms = []

  if (width || height) {
    const parts = []
    if (width) parts.push(`w_${width}`)
    if (height) parts.push(`h_${height}`)
    parts.push(`c_${crop}`)
    if (gravity) parts.push(`g_${gravity}`)
    transforms.push(parts.join(','))
  }

  if (quality) transforms.push(`q_${quality}`)
  if (format) transforms.push(`f_${format}`)
  if (effect) transforms.push(`e_${effect}`)

  const transformString = transforms.length > 0 ? transforms.join('/') + '/' : ''

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}${publicId}`
}

/**
 * Deletes an asset from Cloudinary by its public ID.
 *
 * @param {string} publicId     — Cloudinary public ID
 * @param {string} [resourceType='image'] — Resource type ('image', 'raw', 'video')
 * @returns {Promise<{ result: string }>} Deletion result ('ok' or 'not found')
 */
export async function deleteAsset(publicId, resourceType = 'image') {
  const { cloudName, apiKey, apiSecret } = getConfig()
  const timestamp = Math.floor(Date.now() / 1000).toString()

  const params = { public_id: publicId, timestamp }
  const signature = generateSignature(params, apiSecret)

  const formData = new FormData()
  formData.append('public_id', publicId)
  formData.append('api_key', apiKey)
  formData.append('signature', signature)
  formData.append('timestamp', timestamp)

  const response = await fetch(
    `${UPLOAD_URL}/${cloudName}/${resourceType}/destroy`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(
      `[Cloudinary] Delete failed (${response.status}): ${errorBody?.error?.message || 'Unknown error'}`
    )
  }

  return response.json()
}
