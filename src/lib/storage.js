/**
 * @fileoverview Unified Storage Manager for FurnAI.
 *
 * Wraps Supabase Storage to provide high-level methods for uploading,
 * retrieving, and deleting design assets (thumbnails, 3D models, exports).
 * All files are organized into three buckets:
 *   - `thumbnails` — Design preview images
 *   - `models`     — 3D model files (GLB, GLTF, OBJ, etc.)
 *   - `exports`    — Export files (DXF, PDF, ZIP packages)
 *
 * @requires @/lib/supabase/client — Browser-side Supabase client
 *
 * @example
 *   import { uploadDesignThumbnail, getPublicUrl } from '@/lib/storage'
 *
 *   const { path } = await uploadDesignThumbnail(userId, designId, imageFile)
 *   const url = getPublicUrl('thumbnails', path)
 */

import { createClient } from '@/lib/supabase/client'

/**
 * Bucket name constants. These must match the Supabase Storage buckets
 * configured in your Supabase project dashboard.
 * @enum {string}
 */
const BUCKETS = {
  THUMBNAILS: 'thumbnails',
  MODELS: 'models',
  EXPORTS: 'exports',
}

/**
 * Maximum file size limits per bucket (in bytes).
 * @enum {number}
 */
const MAX_FILE_SIZES = {
  [BUCKETS.THUMBNAILS]: 10 * 1024 * 1024,   // 10 MB
  [BUCKETS.MODELS]: 100 * 1024 * 1024,       // 100 MB
  [BUCKETS.EXPORTS]: 50 * 1024 * 1024,       // 50 MB
}

/**
 * Allowed MIME types per bucket.
 * @type {Record<string, string[]>}
 */
const ALLOWED_TYPES = {
  [BUCKETS.THUMBNAILS]: [
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/avif',
  ],
  [BUCKETS.MODELS]: [
    'model/gltf-binary',      // .glb
    'model/gltf+json',        // .gltf
    'application/octet-stream', // fallback for .glb, .obj, .fbx
  ],
  [BUCKETS.EXPORTS]: [
    'application/pdf',
    'application/zip',
    'application/dxf',
    'application/octet-stream', // fallback for DXF
    'image/vnd.dxf',
  ],
}

// ─────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────

/**
 * Returns a Supabase client instance.
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
function getSupabase() {
  return createClient()
}

/**
 * Validates a file before upload.
 *
 * @param {File | Blob} file     — The file to validate
 * @param {string}      bucket   — Target bucket name
 * @throws {Error} If the file exceeds size limits or has an invalid type
 */
function validateFile(file, bucket) {
  if (!file) {
    throw new Error(`[Storage] File is required for upload.`)
  }

  const maxSize = MAX_FILE_SIZES[bucket]
  if (maxSize && file.size > maxSize) {
    const maxMB = (maxSize / (1024 * 1024)).toFixed(0)
    const fileMB = (file.size / (1024 * 1024)).toFixed(1)
    throw new Error(
      `[Storage] File too large (${fileMB} MB). Maximum for "${bucket}" bucket is ${maxMB} MB.`
    )
  }

  const allowedTypes = ALLOWED_TYPES[bucket]
  if (allowedTypes && file.type && !allowedTypes.includes(file.type)) {
    // Don't block application/octet-stream as it's a common fallback
    if (file.type !== 'application/octet-stream') {
      console.warn(
        `[Storage] File type "${file.type}" is not in the allowed list for "${bucket}". Upload may fail.`
      )
    }
  }
}

/**
 * Generates a unique file path for a design asset.
 *
 * @param {string} userId   — User ID
 * @param {string} designId — Design ID
 * @param {string} filename — Original filename
 * @returns {string} Scoped file path (e.g., "user_abc/design_123/thumbnail_1718134500.png")
 */
function buildPath(userId, designId, filename) {
  const timestamp = Date.now()
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `${userId}/${designId}/${timestamp}_${safeFilename}`
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

/**
 * Uploads a design thumbnail image to the `thumbnails` bucket.
 *
 * @param {string}      userId   — Owner user ID
 * @param {string}      designId — Design ID
 * @param {File | Blob}  file    — Image file to upload
 * @returns {Promise<{ path: string, fullPath: string }>} The stored file path
 * @throws {Error} On validation failure or Supabase Storage error
 *
 * @example
 *   const thumbnailFile = new File([blob], 'preview.png', { type: 'image/png' })
 *   const { path } = await uploadDesignThumbnail('user_1', 'design_abc', thumbnailFile)
 */
export async function uploadDesignThumbnail(userId, designId, file) {
  if (!userId || !designId) {
    throw new Error('[Storage] userId and designId are required.')
  }

  validateFile(file, BUCKETS.THUMBNAILS)

  const supabase = getSupabase()
  const path = buildPath(userId, designId, file.name || 'thumbnail.png')

  const { data, error } = await supabase.storage
    .from(BUCKETS.THUMBNAILS)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/png',
    })

  if (error) {
    throw new Error(`[Storage] Failed to upload thumbnail: ${error.message}`)
  }

  return { path: data.path, fullPath: data.fullPath || `${BUCKETS.THUMBNAILS}/${data.path}` }
}

/**
 * Uploads a 3D model file to the `models` bucket.
 *
 * @param {string}      userId   — Owner user ID
 * @param {string}      designId — Design ID
 * @param {File | Blob}  file    — 3D model file to upload
 * @param {string}      [format='glb'] — Model format hint ('glb', 'gltf', 'obj', 'fbx', 'usdz')
 * @returns {Promise<{ path: string, fullPath: string }>} The stored file path
 * @throws {Error} On validation failure or Supabase Storage error
 *
 * @example
 *   const modelBlob = new Blob([glbBuffer], { type: 'model/gltf-binary' })
 *   const { path } = await uploadModel('user_1', 'design_abc', modelBlob, 'glb')
 */
export async function uploadModel(userId, designId, file, format = 'glb') {
  if (!userId || !designId) {
    throw new Error('[Storage] userId and designId are required.')
  }

  validateFile(file, BUCKETS.MODELS)

  const supabase = getSupabase()
  const filename = file.name || `model.${format}`
  const path = buildPath(userId, designId, filename)

  const contentTypeMap = {
    glb: 'model/gltf-binary',
    gltf: 'model/gltf+json',
    obj: 'application/octet-stream',
    fbx: 'application/octet-stream',
    usdz: 'application/octet-stream',
  }

  const { data, error } = await supabase.storage
    .from(BUCKETS.MODELS)
    .upload(path, file, {
      cacheControl: '86400',
      upsert: false,
      contentType: file.type || contentTypeMap[format] || 'application/octet-stream',
    })

  if (error) {
    throw new Error(`[Storage] Failed to upload model: ${error.message}`)
  }

  return { path: data.path, fullPath: data.fullPath || `${BUCKETS.MODELS}/${data.path}` }
}

/**
 * Uploads an export file (DXF, PDF, ZIP) to the `exports` bucket.
 *
 * @param {string}      userId     — Owner user ID
 * @param {string}      designId   — Design ID
 * @param {File | Blob}  file      — Export file to upload
 * @param {string}      exportType — Export format ('dxf', 'pdf', 'zip')
 * @returns {Promise<{ path: string, fullPath: string }>} The stored file path
 * @throws {Error} On validation failure or Supabase Storage error
 *
 * @example
 *   const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' })
 *   const { path } = await uploadExport('user_1', 'design_abc', pdfBlob, 'pdf')
 */
export async function uploadExport(userId, designId, file, exportType) {
  if (!userId || !designId) {
    throw new Error('[Storage] userId and designId are required.')
  }
  if (!exportType) {
    throw new Error('[Storage] exportType is required (e.g., "dxf", "pdf", "zip").')
  }

  validateFile(file, BUCKETS.EXPORTS)

  const supabase = getSupabase()
  const filename = file.name || `export.${exportType}`
  const path = buildPath(userId, designId, filename)

  const contentTypeMap = {
    dxf: 'application/dxf',
    pdf: 'application/pdf',
    zip: 'application/zip',
  }

  const { data, error } = await supabase.storage
    .from(BUCKETS.EXPORTS)
    .upload(path, file, {
      cacheControl: '86400',
      upsert: false,
      contentType: file.type || contentTypeMap[exportType] || 'application/octet-stream',
    })

  if (error) {
    throw new Error(`[Storage] Failed to upload export: ${error.message}`)
  }

  return { path: data.path, fullPath: data.fullPath || `${BUCKETS.EXPORTS}/${data.path}` }
}

/**
 * Returns the public URL for a file in a Supabase Storage bucket.
 *
 * @param {string} bucket — Bucket name ('thumbnails', 'models', 'exports')
 * @param {string} path   — File path within the bucket
 * @returns {string} Publicly accessible URL
 *
 * @example
 *   const url = getPublicUrl('thumbnails', 'user_1/design_abc/1718134500_preview.png')
 */
export function getPublicUrl(bucket, path) {
  if (!bucket || !path) {
    throw new Error('[Storage] bucket and path are required.')
  }

  const supabase = getSupabase()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)

  return data.publicUrl
}

/**
 * Deletes a file from a Supabase Storage bucket.
 *
 * @param {string} bucket — Bucket name ('thumbnails', 'models', 'exports')
 * @param {string} path   — File path within the bucket
 * @returns {Promise<void>}
 * @throws {Error} On Supabase Storage error
 *
 * @example
 *   await deleteFile('thumbnails', 'user_1/design_abc/1718134500_preview.png')
 */
export async function deleteFile(bucket, path) {
  if (!bucket || !path) {
    throw new Error('[Storage] bucket and path are required.')
  }

  const supabase = getSupabase()

  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    throw new Error(`[Storage] Failed to delete file "${path}" from "${bucket}": ${error.message}`)
  }
}

/**
 * Lists all files in a bucket path for a specific design.
 *
 * @param {string} bucket   — Bucket name ('thumbnails', 'models', 'exports')
 * @param {string} userId   — Owner user ID
 * @param {string} designId — Design ID
 * @returns {Promise<Array<{ name: string, id: string, metadata: object }>>} File listing
 *
 * @example
 *   const files = await listDesignFiles('models', 'user_1', 'design_abc')
 */
export async function listDesignFiles(bucket, userId, designId) {
  if (!bucket || !userId || !designId) {
    throw new Error('[Storage] bucket, userId, and designId are required.')
  }

  const supabase = getSupabase()
  const folderPath = `${userId}/${designId}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folderPath, { sortBy: { column: 'created_at', order: 'desc' } })

  if (error) {
    throw new Error(`[Storage] Failed to list files in "${bucket}/${folderPath}": ${error.message}`)
  }

  return data || []
}
