import { NextResponse } from "next/server";
import opentype from "opentype.js";

interface FvarAxis {
  tag: string;
  name?: Record<string, string>;
  minValue: number;
  defaultValue: number;
  maxValue: number;
}

interface FvarTable {
  axes?: FvarAxis[];
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ axes: [] });
  }

  try {
    const buffer = await file.arrayBuffer();
    const parsed = opentype.parse(buffer);
    const tables = parsed.tables as unknown;
    const fvarTable = (tables as { fvar?: FvarTable }).fvar;

    if (!fvarTable || !Array.isArray(fvarTable.axes)) {
      return NextResponse.json({ axes: [] });
    }

    const axes = fvarTable.axes.map((axis) => ({
      tag: axis.tag,
      name: axis.name?.en ?? axis.tag,
      min: axis.minValue,
      max: axis.maxValue,
      default: axis.defaultValue,
    }));

    return NextResponse.json({ axes });
  } catch (err) {
    console.error("opentype.js error:", err);
    return NextResponse.json({ axes: [] });
  }
}
