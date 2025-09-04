import opentype from "opentype.js";
import * as fontkit from "fontkit";

export interface AxisResult {
  tag: string;
  name: string;
  min: number;
  max: number;
  default: number;
}

export interface FontkitFont {
  GSUB?: {
    scriptList?: {
      tag: string;
      script?: {
        defaultLangSys?: unknown;
        langSysRecords?: { tag: string }[];
      };
    }[];
  };
}

interface FvarAxisRaw {
  tag: string;
  name?: Record<string, string>;
  minValue: number;
  defaultValue: number;
  maxValue: number;
}

export type NameRecord = {
  [lang: string]: string | undefined;
};

export const UNICODE_SCRIPT_RANGES: Array<readonly [string, number, number]> = [
  ["latn", 0x0000, 0x024f],
  ["grek", 0x0370, 0x03ff],
  ["cyrl", 0x0400, 0x052f],
  ["armn", 0x0530, 0x058f],
  ["hebr", 0x0590, 0x05ff],
  ["arab", 0x0600, 0x06ff],
  ["syrc", 0x0700, 0x074f],
  ["thaa", 0x0780, 0x07bf],
  ["deva", 0x0900, 0x097f],
  ["beng", 0x0980, 0x09ff],
  ["guru", 0x0a00, 0x0a7f],
  ["gujr", 0x0a80, 0x0aff],
  ["orya", 0x0b00, 0x0b7f],
  ["taml", 0x0b80, 0x0bff],
  ["telu", 0x0c00, 0x0c7f],
  ["knda", 0x0c80, 0x0cff],
  ["mlym", 0x0d00, 0x0d7f],
  ["sinh", 0x0d80, 0x0dff],
  ["thai", 0x0e00, 0x0e7f],
  ["lao ", 0x0e80, 0x0eff],
  ["tibt", 0x0f00, 0x0fff],
  ["mymr", 0x1000, 0x109f],
  ["geor", 0x10a0, 0x10ff],
  ["hani", 0x4e00, 0x9fff],
  ["kana", 0x30a0, 0x30ff],
  ["hira", 0x3040, 0x309f],
];

export const SCRIPT_NAME_MAP: Record<string, string> = {
  latn: "Latin",
  cyrl: "Cyrillic",
  grek: "Greek",
  arab: "Arabic",
  hebr: "Hebrew",
  deva: "Devanagari",
  thai: "Thai",
  armn: "Armenian",
  geor: "Georgian",
  hani: "Han",
  hira: "Hiragana",
  kana: "Katakana",
  hang: "Hangul",
};

export const LANGUAGE_NAME_MAP: Record<string, string> = {
  dflt: "Default",
  BGR: "Bulgarian",
  SRB: "Serbian",
  MKD: "Macedonian",
  ROM: "Romanian",
  MOL: "Moldovan",
  CAT: "Catalan",
  NLD: "Dutch",
  AZE: "Azeri",
  CRT: "Crimean Tatar",
};

export const scriptName = (tag: string) =>
  SCRIPT_NAME_MAP[tag] ?? tag.toUpperCase();

export const langName = (tag: string) =>
  LANGUAGE_NAME_MAP[tag] ?? tag.toUpperCase();

export function detectScript(unicode: number): string | undefined {
  for (const [tag, start, end] of UNICODE_SCRIPT_RANGES) {
    if (unicode >= start && unicode <= end) {
      return tag.trim();
    }
  }
  return undefined;
}

export function parseAxes(buffer: ArrayBuffer): AxisResult[] {
  try {
    const parsed = opentype.parse(buffer);
    const fvar = parsed.tables.fvar as { axes?: FvarAxisRaw[] } | undefined;

    if (!fvar?.axes) return [];

    return fvar.axes.map(
      (axis): AxisResult => ({
        tag: axis.tag,
        name: axis.name?.en ?? axis.tag,
        min: axis.minValue,
        max: axis.maxValue,
        default: axis.defaultValue,
      }),
    );
  } catch {
    return [];
  }
}

export function parseSupportedScripts(buffer: ArrayBuffer): string[] {
  try {
    const parsed = opentype.parse(buffer);

    const cmapTable = parsed.tables as unknown as {
      cmap?: { glyphIndexMap?: Record<string, number> };
    };

    const cmap = cmapTable.cmap?.glyphIndexMap ?? {};
    const found = new Set<string>();

    for (const key of Object.keys(cmap)) {
      const unicode = Number(key);
      const script = detectScript(unicode);
      if (script) found.add(script);
    }

    return [...found];
  } catch {
    return [];
  }
}

export function parseGsubLanguages(buffer: Buffer): Record<string, string[]> {
  try {
    const fkFont = fontkit.create(buffer) as FontkitFont;
    const scripts = fkFont.GSUB?.scriptList ?? [];

    const out: Record<string, string[]> = {};

    for (const rec of scripts) {
      const script = rec.script;
      const set = new Set<string>();

      if (script?.defaultLangSys) set.add("dflt");
      script?.langSysRecords?.forEach((l) => set.add(l.tag.trim()));

      out[rec.tag] = [...set];
    }

    return out;
  } catch {
    return {};
  }
}

export function buildScriptLanguageMap(
  supportedScripts: string[],
  gsubLanguages: Record<string, string[]>,
) {
  return supportedScripts.map((scriptTag) => ({
    script: scriptName(scriptTag),
    tag: scriptTag,
    languages: (gsubLanguages[scriptTag] ?? ["dflt"]).map((l) => ({
      tag: l,
      name: langName(l),
    })),
  }));
}

export function getNameEntry(
  entry: NameRecord | undefined,
): string | undefined {
  if (!entry) return undefined;

  if (entry.en) return entry.en;
  if (entry.English) return entry.English;

  const values = Object.values(entry);
  const first = values.find((v) => typeof v === "string");
  return first as string | undefined;
}

function extractCleanVersion(raw?: string): string | undefined {
  if (!raw) return undefined;

  const match = raw.match(/(\d+(\.\d+)+)/);

  return match ? match[1] : raw;
}

export function extractFontMetadata(
  arrayBuffer: ArrayBuffer,
  file: File,
  axes: AxisResult[],
) {
  try {
    const font = opentype.parse(arrayBuffer);
    const names = font.names;

    const name =
      getNameEntry(names.fullName as NameRecord) ||
      file.name.replace(/\.[^/.]+$/, "");

    const rawVersion = getNameEntry(names.version as NameRecord);
    const version = extractCleanVersion(rawVersion);

    const designer = getNameEntry(names.designer as NameRecord);

    return {
      name,
      version,
      designer,
      fileSize: file.size,
      axes,
    };
  } catch {
    return {
      name: file.name.replace(/\.[^/.]+$/, ""),
      version: undefined,
      designer: undefined,
      fileSize: file.size,
      axes,
    };
  }
}
