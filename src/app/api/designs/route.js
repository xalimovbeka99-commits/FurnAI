import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/designs — list designs for authenticated user
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json([]);
    }

    const { data, error } = await supabase
      .from("designs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[designs] Supabase error:", error);
      return NextResponse.json([]);
    }

    // Transform to match frontend format
    const designs = (data || []).map((d) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      style: d.style || "modern",
      material: d.params?.material || "wood",
      color: d.params?.color || "#8B7355",
      width: d.params?.width || 120,
      height: d.params?.height || 200,
      depth: d.params?.depth || 60,
      prompt: d.params?.prompt || "",
      kitchen: d.params?.kitchen,
      savedAt: d.created_at,
      supabaseId: d.id,
    }));

    return NextResponse.json(designs);
  } catch (error) {
    console.error("[designs] Error:", error);
    return NextResponse.json([]);
  }
}
