import { NextResponse } from "next/server";
import { generateFactorySpec } from "@/lib/factoryExport";

export async function POST(request) {
  try {
    const design = await request.json();

    if (!design || !design.type) {
      return NextResponse.json(
        { error: "Invalid design data" },
        { status: 400 }
      );
    }

    // Convert cm to mm for factory spec
    const specDesign = {
      ...design,
      width: design.width * 10,
      height: design.height * 10,
      depth: design.depth * 10,
    };

    const spec = generateFactorySpec(specDesign);

    return NextResponse.json(spec);
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to generate factory export" },
      { status: 500 }
    );
  }
}
