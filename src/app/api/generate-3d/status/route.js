/**
 * @fileoverview 3D Generation Status Polling Route
 *
 * GET /api/generate-3d/status?taskId=xxx
 *   Polls the Meshy API for the current status of a 3D generation task.
 *   Returns enriched status with progress, model URLs, and thumbnail.
 *
 *   Response: {
 *     status: 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED' | 'EXPIRED',
 *     progress: number (0–100),
 *     modelUrl?: string,
 *     thumbnailUrl?: string,
 *     textureUrls?: object,
 *     createdAt?: string,
 *     finishedAt?: string
 *   }
 */

import { NextResponse } from "next/server";

/** Meshy API base URL */
const MESHY_API_BASE = "https://api.meshy.ai/openapi/v2";

/**
 * GET /api/generate-3d/status?taskId=xxx
 *
 * Polls the Meshy API for detailed task status. Attempts text-to-3d first,
 * falls back to image-to-3d if not found.
 *
 * @param {Request} request
 * @returns {Promise<NextResponse>} Detailed task status payload.
 */
export async function GET(request) {
  try {
    const apiKey = process.env.MESHY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Meshy API key is not configured" },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { error: "Query parameter 'taskId' is required" },
        { status: 400 }
      );
    }

    // ── Fetch task from Meshy ────────────────────────────────────────
    const headers = { Authorization: `Bearer ${apiKey}` };

    // Try text-to-3d pipeline first
    let response = await fetch(`${MESHY_API_BASE}/text-to-3d/${taskId}`, { headers });
    let pipeline = "text-to-3d";

    // Fallback to image-to-3d if not found
    if (response.status === 404) {
      response = await fetch(`${MESHY_API_BASE}/image-to-3d/${taskId}`, { headers });
      pipeline = "image-to-3d";
    }

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      console.error("[generate-3d/status] Meshy error:", response.status, errBody);
      return NextResponse.json(
        {
          error: "Failed to fetch task status from Meshy",
          detail: errBody.message || `HTTP ${response.status}`,
        },
        { status: response.status >= 500 ? 502 : response.status }
      );
    }

    const data = await response.json();

    // ── Normalize response ───────────────────────────────────────────
    const result = {
      taskId,
      pipeline,
      status: data.status || "UNKNOWN",
      progress: data.progress ?? 0,
      modelUrl: null,
      thumbnailUrl: data.thumbnail_url || null,
      textureUrls: data.texture_urls || null,
      createdAt: data.created_at || null,
      finishedAt: data.finished_at || null,
    };

    // Extract best available model URL
    if (data.model_urls) {
      result.modelUrl =
        data.model_urls.glb ||
        data.model_urls.fbx ||
        data.model_urls.obj ||
        data.model_urls.usdz ||
        null;

      // Provide all available formats for the client to choose
      result.availableFormats = Object.keys(data.model_urls).filter(
        (k) => data.model_urls[k]
      );
    }

    // Include error message when task failed
    if (data.status === "FAILED" && data.task_error) {
      result.errorMessage = data.task_error.message || "Unknown error";
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[generate-3d/status] Error:", err);
    return NextResponse.json(
      { error: "Failed to poll generation status", detail: err.message },
      { status: 500 }
    );
  }
}
