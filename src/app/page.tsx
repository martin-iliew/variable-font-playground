"use client";

import type React from "react";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Badge } from "@/components/ui/badge";

interface VariableAxis {
  tag: string;
  name: string;
  min: number;
  max: number;
  default: number;
}

interface FontMetadata {
  name: string;
  version?: string;
  designer?: string;
  axes: VariableAxis[];
  fileSize: number;
}

export default function VariableFontPlayground() {
  const [fontFile, setFontFile] = useState<File | null>(null);
  const [fontLoaded, setFontLoaded] = useState(false);
  const [fontFamily, setFontFamily] = useState<string>("");
  const [fontSize, setFontSize] = useState(48);
  const [fontSizeInput, setFontSizeInput] = useState("48");
  const [previewText, setPreviewText] = useState(
    "The quick brown fox jumps over the lazy dog"
  );
  const [axes, setAxes] = useState<VariableAxis[]>([]);
  const [axisValues, setAxisValues] = useState<Record<string, number>>({});
  const [axisInputs, setAxisInputs] = useState<Record<string, string>>({});
  const [metadata, setMetadata] = useState<FontMetadata | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const hasAxis = (tag: string) => axes.some((axis) => axis.tag === tag);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file || (!file.name.endsWith(".ttf") && !file.name.endsWith(".otf"))) {
      return;
    }

    setFontFile(file);
    const arrayBuffer = await file.arrayBuffer();
    const fontName = `CustomFont-${Date.now()}`;

    try {
      const fontFace = new FontFace(fontName, arrayBuffer);
      const loadedFont = await fontFace.load();
      document.fonts.add(loadedFont);

      const detectedAxes = detectVariableAxes(loadedFont);

      if (detectedAxes.length === 0) {
        setShowModal(true);
        setFontLoaded(false);
        return;
      }

      setFontFamily(fontName);
      setAxes(detectedAxes);

      const initialValues: Record<string, number> = {};
      const initialInputs: Record<string, string> = {};
      detectedAxes.forEach((axis) => {
        initialValues[axis.tag] = axis.default;
        initialInputs[axis.tag] = axis.default.toString();
      });
      setAxisValues(initialValues);
      setAxisInputs(initialInputs);

      setMetadata({
        name: file.name,
        version: "2.0",
        designer: "Unknown",
        axes: detectedAxes,
        fileSize: file.size,
      });

      setFontLoaded(true);
    } catch (error) {
      console.error("Font loading error:", error);
      setShowModal(true);
    }
  }, []);

  const detectVariableAxes = (font: FontFace): VariableAxis[] => {
    const possibleAxes: VariableAxis[] = [
      { tag: "wght", name: "Weight", min: 100, max: 900, default: 400 },
      { tag: "wdth", name: "Width", min: 50, max: 200, default: 100 },
      { tag: "slnt", name: "Slant", min: 0, max: 12, default: 0 },
      { tag: "opsz", name: "Optical Size", min: 8, max: 72, default: 14 },
      { tag: "ital", name: "Italic", min: 0, max: 1, default: 0 },
    ];

    const testDiv = document.createElement("div");
    testDiv.style.fontFamily = `"${font.family}"`;
    testDiv.style.position = "absolute";
    testDiv.style.visibility = "hidden";
    testDiv.style.whiteSpace = "nowrap";
    testDiv.style.fontSize = "64px";
    testDiv.textContent = "Hamburgefonstiv";
    document.body.appendChild(testDiv);

    const supportedAxes: VariableAxis[] = [];

    for (const axis of possibleAxes) {
      testDiv.style.fontVariationSettings = `"${axis.tag}" ${axis.min}`;
      const minWidth = testDiv.getBoundingClientRect().width;

      testDiv.style.fontVariationSettings = `"${axis.tag}" ${axis.max}`;
      const maxWidth = testDiv.getBoundingClientRect().width;

      const diff = Math.abs(maxWidth - minWidth);
      if (diff > 0.5) {
        supportedAxes.push(axis);
      }
    }

    document.body.removeChild(testDiv);

    if (supportedAxes.length === 0) {
      supportedAxes.push(supportedAxes[0]);
    }

    return supportedAxes.filter(Boolean);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const updateAxisValue = (tag: string, value: number) => {
    setAxisValues((prev) => ({ ...prev, [tag]: value }));
    setAxisInputs((prev) => ({ ...prev, [tag]: value.toString() }));
  };

  const handleAxisInputChange = (tag: string, value: string) => {
    setAxisInputs((prev) => ({ ...prev, [tag]: value }));

    const numValue = Number.parseFloat(value);
    if (!isNaN(numValue)) {
      const axis = axes.find((a) => a.tag === tag);
      if (axis) {
        const clampedValue = Math.max(axis.min, Math.min(axis.max, numValue));
        setAxisValues((prev) => ({ ...prev, [tag]: clampedValue }));
      }
    }
  };

  const handleAxisInputBlur = (tag: string) => {
    const axis = axes.find((a) => a.tag === tag);
    if (axis && axisInputs[tag] === "") {
      setAxisInputs((prev) => ({ ...prev, [tag]: axis.default.toString() }));
      setAxisValues((prev) => ({ ...prev, [tag]: axis.default }));
    }
  };

  const handleFontSizeInputChange = (value: string) => {
    setFontSizeInput(value);
    const numValue = Number.parseFloat(value);
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(12, Math.min(144, numValue));
      setFontSize(clampedValue);
    }
  };

  const handleFontSizeInputBlur = () => {
    if (fontSizeInput === "") {
      setFontSizeInput("48");
      setFontSize(48);
    }
  };

  const applyPreset = (preset: string) => {
    const newValues = { ...axisValues };

    const wghtAxis = axes.find((a) => a.tag === "wght");
    if (wghtAxis) {
      switch (preset) {
        case "Thin":
          newValues.wght = wghtAxis.min;
          break;
        case "Regular":
          newValues.wght = 400;
          break;
        case "Medium":
          newValues.wght = 500;
          break;
        case "Bold":
          newValues.wght = 700;
          break;
        case "ExtraBold":
          newValues.wght = Math.min(800, wghtAxis.max);
          break;
      }
    }

    setAxisValues(newValues);
  };

  const fontVariationSettings = Object.entries(axisValues)
    .map(([tag, value]) => `"${tag}" ${value}`)
    .join(", ");

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1000px] px-6 py-10">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[32px] font-semibold leading-tight tracking-tight">
              Variable Font Playground
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Upload a font and explore its axes
            </p>
          </div>
          <ModeToggle />
        </div>

        <Card className="mb-7 rounded-[12px] border border-border bg-card p-7 shadow-none">
          <Label className="mb-4 block text-[13px] font-medium uppercase tracking-wider text-muted-foreground">
            Upload a variable font (.ttf, .otf)
          </Label>
          <div
            className={`relative flex min-h-[180px] flex-col items-center justify-center rounded-[12px] border-2 border-dashed transition-colors ${
              isDragging
                ? "border-foreground bg-muted/30"
                : "border-border bg-muted/10"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="mb-4 h-8 w-8 text-muted-foreground" />
            <p className="mb-3 text-base text-muted-foreground">
              Drag and drop a font file here, or
            </p>
            <Button
              variant="outline"
              size="sm"
              className="relative rounded-[10px] border-border bg-transparent hover:bg-muted/30"
              onClick={() => document.getElementById("file-input")?.click()}
            >
              Choose File
            </Button>
            <input
              id="file-input"
              type="file"
              accept=".ttf,.otf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
          </div>
          <div className="flex flex-col gap-2 mt-4">
            {fontFile && (
              <p className="text-sm text-muted-foreground">
                Selected:{" "}
                <span className="font-medium text-foreground">
                  {fontFile.name}
                </span>
              </p>
            )}
            {axes.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Supported axes:
                </span>

                {axes.map((axis) => (
                  <Badge key={axis.tag} variant="outline">
                    {axis.tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>

        {fontLoaded && (
          <div className="grid gap-7 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.1fr)]">
            <div className="space-y-7">
              <Card className="rounded-[12px] border border-border bg-card p-7 shadow-none">
                <Label className="mb-5 block text-[13px] font-medium uppercase tracking-wider text-muted-foreground">
                  Font Size
                </Label>
                <div className="flex items-center gap-6">
                  <Slider
                    value={[fontSize]}
                    onValueChange={([value]) => {
                      setFontSize(value);
                      setFontSizeInput(value.toString());
                    }}
                    min={12}
                    max={144}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={fontSizeInput}
                    onChange={(e) => handleFontSizeInputChange(e.target.value)}
                    onBlur={handleFontSizeInputBlur}
                    className="w-24 rounded-[10px] border-border bg-background px-3 py-2"
                    min={12}
                    max={144}
                  />
                </div>
              </Card>
              <Card className="rounded-[12px] border border-border bg-card p-7 shadow-none">
                <Label className="mb-5 block text-[13px] font-medium uppercase tracking-wider text-muted-foreground">
                  Variable Axes
                </Label>
                {axes.length === 0 ? (
                  <p className="text-base text-muted-foreground">
                    No variable axes detected in this font.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {axes.map((axis) => (
                      <div key={axis.tag} className="space-y-3">
                        <div className="flex items-baseline justify-between">
                          <div className="flex items-baseline gap-3">
                            <span className="font-mono text-base font-semibold">
                              {axis.tag}
                            </span>
                            <span className="text-base text-muted-foreground">
                              {axis.name}
                            </span>
                          </div>
                          <span className="text-sm tabular-nums text-muted-foreground">
                            {axis.min}–{axis.max}
                          </span>
                        </div>
                        <div className="flex items-center gap-6">
                          <Slider
                            value={[axisValues[axis.tag] ?? axis.default]}
                            onValueChange={([value]) =>
                              updateAxisValue(axis.tag, value)
                            }
                            min={axis.min}
                            max={axis.max}
                            step={axis.tag === "ital" ? 1 : 0.1}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={axisInputs[axis.tag] ?? axis.default}
                            onChange={(e) =>
                              handleAxisInputChange(axis.tag, e.target.value)
                            }
                            onBlur={() => handleAxisInputBlur(axis.tag)}
                            className="w-28 rounded-[10px] border-border bg-background px-3 py-2"
                            min={axis.min}
                            max={axis.max}
                            step={axis.tag === "ital" ? 1 : 0.1}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {hasAxis("wght") && (
                <Card className="rounded-[12px] border border-border bg-card p-7 shadow-none">
                  <Label className="mb-5 block text-[13px] font-medium uppercase tracking-wider text-muted-foreground">
                    Weight Presets
                  </Label>
                  <div className="flex flex-wrap gap-3">
                    {["Thin", "Regular", "Medium", "Bold", "ExtraBold"].map(
                      (preset) => (
                        <Button
                          key={preset}
                          variant="outline"
                          onClick={() => applyPreset(preset)}
                          className="rounded-[10px] border-border bg-background hover:bg-muted/30"
                        >
                          {preset}
                        </Button>
                      )
                    )}
                  </div>
                </Card>
              )}

              {metadata && (
                <Card className="rounded-[12px] border border-border bg-card p-7 shadow-none">
                  <Label className="mb-5 block text-[13px] font-medium uppercase tracking-wider text-muted-foreground">
                    Font Metadata
                  </Label>
                  <div className="space-y-0 text-base">
                    <div className="flex justify-between border-b border-border py-4">
                      <span className="text-muted-foreground">File Name</span>
                      <span className="font-medium">{metadata.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-border py-4">
                      <span className="text-muted-foreground">Version</span>
                      <span className="font-medium">{metadata.version}</span>
                    </div>
                    <div className="flex justify-between border-b border-border py-4">
                      <span className="text-muted-foreground">Designer</span>
                      <span className="font-medium">{metadata.designer}</span>
                    </div>
                    <div className="flex justify-between border-b border-border py-4">
                      <span className="text-muted-foreground">File Size</span>
                      <span className="font-medium">
                        {(metadata.fileSize / 1024).toFixed(2)} KB
                      </span>
                    </div>
                    <div className="flex justify-between py-4">
                      <span className="text-muted-foreground">Axes</span>
                      <span className="font-medium">
                        {metadata.axes.map((a) => a.tag).join(", ")}
                      </span>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            <Card className="rounded-[12px] border border-border bg-card p-7 shadow-none">
              <Label className="mb-4 block text-[13px] font-medium uppercase tracking-wider text-muted-foreground">
                Preview
              </Label>

              <div
                className="mt-2 h-[320px] rounded-[12px] border border-border bg-muted/20 p-5"
                style={{
                  fontFamily: fontFamily,
                  fontSize: `${fontSize}px`,
                  fontVariationSettings,
                  lineHeight: 1.4,
                }}
              >
                <Textarea
                  className="h-full w-full resize-none border-none bg-transparent p-0 outline-none focus-visible:ring-0"
                  style={{
                    fontSize: `${fontSize}px`,
                    fontVariationSettings,
                    lineHeight: 1.4,
                    fontFamily: fontFamily,
                  }}
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                />
              </div>
            </Card>
          </div>
        )}
      </div>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="rounded-[16px] border border-border bg-card shadow-none sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Not a Variable Font
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              This file does not contain any variable axes.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-2">
            <Button
              onClick={() => setShowModal(false)}
              className="rounded-[10px] bg-primary text-primary-foreground"
            >
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
