import { NextResponse } from "next/server";

import {
  parseAxes,
  parseSupportedScripts,
  parseGsubLanguages,
  buildScriptLanguageMap,
  extractFontMetadata,
} from "@/lib/fonts";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({
      axes: [],
      languages: [],
      metadata: null,
    });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const axes = parseAxes(arrayBuffer);
  const supportedScripts = parseSupportedScripts(arrayBuffer);
  const gsubLanguages = parseGsubLanguages(buffer);
  const languages = buildScriptLanguageMap(supportedScripts, gsubLanguages);

  const metadata = extractFontMetadata(arrayBuffer, file, axes);

  return NextResponse.json({
    axes,
    languages,
    metadata,
  });
}
