import { NextRequest, NextResponse } from "next/server";
import * as fontkit from "fontkit";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) return NextResponse.json({ error: "No file uploaded" });

  const arrayBuffer = await file.arrayBuffer();
  const font = fontkit.create(new Uint8Array(arrayBuffer));

  // axes
  const axes = font.variationAxes
    ? Object.entries(font.variationAxes).map(([tag, v]: any) => ({
        tag,
        min: v.min,
        max: v.max,
        default: v.default,
      }))
    : [];

  // named variations
  const namedVariations = font.namedVariations || {};

  return NextResponse.json({
    familyName: font.familyName,
    designer: font.designer,
    version: font.version,
    axes,
    namedVariations,
  });
}
