/**
 * @fileoverview 3D Model Generation API Route
 *
 * POST /api/generate-3d — Start a 3D model generation task via Meshy.
 *   Body: { prompt: string, artStyle?: string, imageUrl?: string }
 *   - If `imageUrl` is provided → Meshy image-to-3D pipeline
 *   - Otherwise → Meshy text-to-3D pipeline
 *   Returns: { taskId: string, status: 'processing' }
 *
 * GET /api/generate-3d?taskId=xxx — Quick status check for a task.
 *   Returns: { taskId, status, progress?, modelUrl?, thumbnailUrl? }
 */

import { NextResponse } from "next/server";

/** Meshy API base URL */
const MESHY_API_BASE = "https://api.meshy.ai/openapi/v2";

/**
 * Validates that the MESHY_API_KEY environment variable is configured.
 * @returns {{ key: string } | { error: NextResponse }} The API key or an error response.
 */
function getMeshyKey() {
  const key = process.env.MESHY_API_KEY;
  if (!key) {
    return {
      error: NextResponse.json(
        { error: "Meshy API key is not configured" },
        { status: 503 }
      ),
    };
  }
  return { key };
}

/**
 * POST /api/generate-3d
 *
 * Starts a Meshy 3D generation task. Uses image-to-3D when an imageUrl is
 * provided, otherwise falls back to text-to-3D.
 *
 * @param {Request} request
 * @returns {Promise<NextResponse>} JSON with taskId and initial status.
 */
export async function POST(request) {
  try {
    const { key, error } = getMeshyKey();
    if (error) return error;

    const body = await request.json();
    const { prompt, artStyle, imageUrl } = body;

    // ── Validate inputs ──────────────────────────────────────────────
    if (!prompt && !imageUrl) {
      return NextResponse.json(
        { error: "Either 'prompt' or 'imageUrl' is required" },
        { status: 400 }
      );
    }

    // ── Choose pipeline ──────────────────────────────────────────────
    let endpoint;
    let payload;

    if (imageUrl) {
      // Image-to-3D pipeline
      endpoint = `${MESHY_API_BASE}/image-to-3d`;
      payload = {
        image_url: imageUrl,
        ...(artStyle && { art_style: artStyle }),
        enable_pbr: true,
      };
    } else {
      // Text-to-3D pipeline
      endpoint = `${MESHY_API_BASE}/text-to-3d`;
      payload = {
        prompt,
        art_style: artStyle || "realistic",
        negative_prompt: "low quality, blurry, distorted",
        enable_pbr: true,
        topology: "quad",
        target_polycount: 30000,
      };
    }

    // ── Call Meshy API ────────────────────────────────────────────────
    const meshyResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(payload),
    });

    if (!meshyResponse.ok) {
      const errData = await meshyResponse.json().catch(() => ({}));
      console.error("[generate-3d] Meshy API error:", meshyResponse.status, errData);
      return NextResponse.json(
        {
          error: "3D generation service error",
          detail: errData.message || `Meshy returned ${meshyResponse.status}`,
        },
        { status: meshyResponse.status >= 500 ? 502 : meshyResponse.status }
      );
    }

    const data = await meshyResponse.json();

    return NextResponse.json({
      taskId: data.result || data.id,
      status: "processing",
      pipeline: imageUrl ? "image-to-3d" : "text-to-3d",
    });
  } catch (err) {
    console.error("[generate-3d] POST error:", err);
    return NextResponse.json(
      { error: "Failed to start 3D generation", detail: err.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/generate-3d?taskId=xxx
 *
 * Quick status check — fetches the current state of a Meshy generation task.
 *
 * @param {Request} request
 * @returns {Promise<NextResponse>} Current task status.
 */
export async function GET(request) {
  try {
    const { key, error } = getMeshyKey();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { error: "Query parameter 'taskId' is required" },
        { status: 400 }
      );
    }

    // Try text-to-3d endpoint first (most common)
    let meshyResponse = await fetch(`${MESHY_API_BASE}/text-to-3d/${taskId}`, {
      headers: { Authorization: `Bearer ${key}` },
    });

    // If not found, try image-to-3d endpoint
    if (meshyResponse.status === 404) {
      meshyResponse = await fetch(`${MESHY_API_BASE}/image-to-3d/${taskId}`, {
        headers: { Authorization: `Bearer ${key}` },
      });
    }

    if (!meshyResponse.ok) {
      const errData = await meshyResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: "Failed to fetch task status", detail: errData.message },
        { status: meshyResponse.status }
      );
    }

    const data = await meshyResponse.json();

    return NextResponse.json({
      taskId,
      status: data.status,
      progress: data.progress ?? 0,
      modelUrl: data.model_urls?.glb || data.model_urls?.obj || null,
      thumbnailUrl: data.thumbnail_url || null,
      textureUrls: data.texture_urls || null,
    });
  } catch (err) {
    console.error("[generate-3d] GET error:", err);
    return NextResponse.json(
      { error: "Failed to check task status", detail: err.message },
      { status: 500 }
    );
  }
}
