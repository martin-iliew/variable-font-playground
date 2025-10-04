"use client";

import { useState } from "react";

export interface VariableAxis {
  tag: string;
  name: string;
  min: number;
  max: number;
  default: number;
}

export interface FontMetadata {
  name: string;
  version?: string;
  designer?: string;
  axes: VariableAxis[];
  fileSize: number;
}
const SAMPLE_TEXTS = {
  title: "ABCDEFGHIJKLMN\nOPQRSTUVWXYZ\n0123456789",
  pangram: "The quick brown fox jumps over the lazy dog 0123456789",
  paragraph:
    "Almost before we knew it, we had left the ground. The quick brown fox jumps over the lazy dog.",
  wikipedia:
    "Variable fonts are an evolution of the OpenType font specification that allow a single font file to behave like multiple fonts.",
} as const;

export function useVariableFontPlayground() {
  const [fontFile, setFontFile] = useState<File | null>(null);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [fontFamily, setFontFamily] = useState("");
  const [fontSize, setFontSize] = useState(48);
  const [fontSizeInput, setFontSizeInput] = useState("48");

  const [previewText, setPreviewText] = useState(
    "The quick brown fox jumps over the lazy dog",
  );

  const [axes, setAxes] = useState<VariableAxis[]>([]);
  const [axisValues, setAxisValues] = useState<Record<string, number>>({});
  const [axisInputs, setAxisInputs] = useState<Record<string, string>>({});
  const [metadata, setMetadata] = useState<FontMetadata | null>(null);

  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleFontLoaded = (data: {
    file: File;
    fontFamily: string;
    axes: VariableAxis[];
    metadata: FontMetadata;
  }) => {
    console.log(data);
    setFontFile(data.file);
    setFontFamily(data.fontFamily);
    setAxes(data.axes);

    const vals: Record<string, number> = {};
    const inputs: Record<string, string> = {};

    data.axes.forEach((a) => {
      vals[a.tag] = a.default;
      inputs[a.tag] = String(a.default);
    });

    setAxisValues(vals);
    setAxisInputs(inputs);
    setMetadata(data.metadata);
    setFontLoaded(true);
  };

  const updateAxisValue = (tag: string, value: number) => {
    setAxisValues((prev) => ({ ...prev, [tag]: value }));
    setAxisInputs((prev) => ({ ...prev, [tag]: String(value) }));
  };

  const handleAxisInputChange = (tag: string, value: string) => {
    setAxisInputs((prev) => ({ ...prev, [tag]: value }));

    const num = Number(value);
    if (!isNaN(num)) {
      const axis = axes.find((a) => a.tag === tag);
      if (axis) {
        const clamped = Math.max(axis.min, Math.min(axis.max, num));
        setAxisValues((prev) => ({ ...prev, [tag]: clamped }));
      }
    }
  };

  const handleAxisInputBlur = (tag: string) => {
    const axis = axes.find((a) => a.tag === tag);
    if (axis && axisInputs[tag] === "") {
      setAxisInputs((prev) => ({ ...prev, [tag]: String(axis.default) }));
      setAxisValues((prev) => ({ ...prev, [tag]: axis.default }));
    }
  };

  const handleFontSizeInputChange = (v: string) => {
    setFontSizeInput(v);
    const num = Number(v);
    if (!isNaN(num)) {
      setFontSize(Math.max(12, Math.min(144, num)));
    }
  };

  const handleFontSizeInputBlur = () => {
    if (fontSizeInput === "") {
      setFontSizeInput("48");
      setFontSize(48);
    }
  };
  const handlePresetClick = (key: keyof typeof SAMPLE_TEXTS) => {
    setPreviewText(SAMPLE_TEXTS[key]);
  };

  const handleCopyCss = () => {
    if (!fontFamily) return;

    const css = [
      `font-family: "${fontFamily}";`,
      `font-size: ${fontSize}px;`,
      fontVariationSettings &&
        `font-variation-settings: ${fontVariationSettings};`,
    ]
      .filter(Boolean)
      .join("\n");

    void navigator.clipboard.writeText(css);
  };
  const resetAllAxes = () => {
    const newAxisValues: Record<string, number> = {};
    const newAxisInputs: Record<string, string> = {};

    axes.forEach((axis) => {
      newAxisValues[axis.tag] = axis.default;
      newAxisInputs[axis.tag] = String(axis.default);
    });

    setAxisValues(newAxisValues);
    setAxisInputs(newAxisInputs);
  };

  const fontVariationSettings = Object.entries(axisValues)
    .map(([tag, value]) => `"${tag}" ${value}`)
    .join(", ");

  return {
    fontFile,
    fontLoaded,
    fontFamily,
    fontSize,
    fontSizeInput,
    previewText,
    axes,
    axisValues,
    axisInputs,
    metadata,
    showUploadModal,

    setPreviewText,
    setShowUploadModal,
    setFontSize,
    setFontSizeInput,

    handleFontLoaded,
    updateAxisValue,
    handleAxisInputChange,
    handleAxisInputBlur,
    handleFontSizeInputChange,
    handleFontSizeInputBlur,
    resetAllAxes,
    handlePresetClick,
    handleCopyCss,

    fontVariationSettings,
  };
}
