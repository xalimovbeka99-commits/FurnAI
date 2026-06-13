import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/save — save a new design
export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to save designs" },
        { status: 401 }
      );
    }

    const design = await request.json();

    if (!design || !design.type) {
      return NextResponse.json({ error: "Invalid design" }, { status: 400 });
    }

    const { data, error } = await supabase.from("designs").insert({
      user_id: user.id,
      name: design.name || `${design.style || "Custom"} ${design.type}`,
      type: design.type,
      style: design.style || "modern",
      params: {
        material: design.material,
        color: design.color,
        width: design.width,
        height: design.height,
        depth: design.depth,
        prompt: design.prompt,
        doorType: design.doorType,
        handleStyle: design.handleStyle,
        drawerRows: design.drawerRows,
        hangerRods: design.hangerRods,
        ledLighting: design.ledLighting,
        kitchen: design.kitchen,
      },
    }).select().single();

    if (error) {
      console.error("[save] Supabase error:", error);
      return NextResponse.json({ error: "Failed to save design" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      design: {
        id: data.id,
        name: data.name,
        type: data.type,
        style: data.style,
        ...data.params,
        savedAt: data.created_at,
        supabaseId: data.id,
      },
    });
  } catch (error) {
    console.error("[save] Error:", error);
    return NextResponse.json({ error: "Failed to save design" }, { status: 500 });
  }
}

// PUT /api/save — update a design (rename)
export async function PUT(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id, name } = await request.json();

    if (!id || !name) {
      return NextResponse.json({ error: "ID and name are required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("designs")
      .update({ name, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("[save/put] Supabase error:", error);
      return NextResponse.json({ error: "Failed to update design" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[save/put] Error:", error);
    return NextResponse.json({ error: "Failed to update design" }, { status: 500 });
  }
}

// DELETE /api/save — delete a design
export async function DELETE(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Design ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("designs")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("[save/delete] Supabase error:", error);
      return NextResponse.json({ error: "Failed to delete design" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[save/delete] Error:", error);
    return NextResponse.json({ error: "Failed to delete design" }, { status: 500 });
  }
}
