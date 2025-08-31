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
  const [fontFamily, setFontFamily] = useState("");
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

  const hasAxis = (tag: string) => axes.some((a) => a.tag === tag);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file || (!file.name.endsWith(".ttf") && !file.name.endsWith(".otf"))) {
      return;
    }
    try {
      setFontFile(file);
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/axes", { method: "POST", body: form });
      const { axes: detectedAxes } = (await res.json()) as {
        axes: VariableAxis[];
      };
      const arrayBuffer = await file.arrayBuffer();
      const fontName = `CustomFont-${Date.now()}`;
      const fontFace = new FontFace(fontName, arrayBuffer);
      await fontFace.load();
      document.fonts.add(fontFace);

      setFontFamily(fontName);
      if (!detectedAxes || detectedAxes.length === 0) {
        setShowModal(true);
        setFontLoaded(false);
        return;
      }
      setAxes(detectedAxes);

      const vals: Record<string, number> = {};
      const inputs: Record<string, string> = {};

      detectedAxes.forEach((a) => {
        vals[a.tag] = a.default;
        inputs[a.tag] = String(a.default);
      });

      setAxisValues(vals);
      setAxisInputs(inputs);

      setMetadata({
        name: file.name,
        version: "Unknown",
        designer: "Unknown",
        axes: detectedAxes,
        fileSize: file.size,
      });

      setFontLoaded(true);
    } catch (err) {
      console.error("Font load error:", err);
      setShowModal(true);
    }
  }, []);

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

  const fontVariationSettings = Object.entries(axisValues)
    .map(([tag, value]) => `"${tag}" ${value}`)
    .join(", ");

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1000px] px-6 py-10">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-[32px] font-semibold">
              Variable Font Playground
            </h1>
            <p className="text-base text-muted-foreground">
              Upload a font and explore its axes
            </p>
          </div>
          <ModeToggle />
        </div>

        {/* Upload */}
        <Card className="mb-7 rounded-[12px] border border-border bg-card p-7">
          <Label className="mb-4 block text-[13px] uppercase text-muted-foreground">
            Upload a variable font (.ttf, .otf)
          </Label>

          <div
            className={`relative flex min-h-[180px] flex-col items-center justify-center rounded-[12px] border-2 border-dashed ${
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
              className="rounded-[10px]"
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
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
              }}
            />
          </div>

          {fontFile && (
            <p className="mt-4 text-sm text-muted-foreground">
              Selected: <span className="font-medium">{fontFile.name}</span>
            </p>
          )}

          {axes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">
                Supported axes:
              </span>
              {axes.map((a) => (
                <Badge variant="outline" key={a.tag}>
                  {a.tag}
                </Badge>
              ))}
            </div>
          )}
        </Card>

        {fontLoaded && (
          <div className="grid gap-7 md:grid-cols-[1.2fr_1.1fr]">
            {/* Left */}
            <div className="space-y-7">
              {/* Font Size */}
              <Card className="rounded-[12px] border border-border bg-card p-7">
                <Label className="text-[13px] uppercase text-muted-foreground">
                  Font Size
                </Label>

                <div className="mt-5 flex items-center gap-6">
                  <Slider
                    value={[fontSize]}
                    onValueChange={([v]) => {
                      setFontSize(v);
                      setFontSizeInput(String(v));
                    }}
                    min={12}
                    max={144}
                    step={1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    className="w-24 rounded-[10px]"
                    value={fontSizeInput}
                    onChange={(e) => handleFontSizeInputChange(e.target.value)}
                    onBlur={handleFontSizeInputBlur}
                  />
                </div>
              </Card>

              {/* AXES */}
              <Card className="rounded-[12px] border border-border bg-card p-7">
                <Label className="text-[13px] uppercase text-muted-foreground">
                  Variable Axes
                </Label>

                <div className="mt-5 max-h-[480px] overflow-y-auto pr-2 space-y-6">
                  {axes.map((axis) => (
                    <div key={axis.tag} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-mono font-semibold">
                          {axis.tag}
                        </span>
                        <span className="text-muted-foreground tabular-nums">
                          {axis.min} – {axis.max}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <Slider
                          value={[axisValues[axis.tag] ?? axis.default]}
                          onValueChange={([v]) => updateAxisValue(axis.tag, v)}
                          min={axis.min}
                          max={axis.max}
                          step={axis.tag === "ital" ? 1 : 0.1}
                          className="flex-1"
                        />

                        <Input
                          type="number"
                          value={axisInputs[axis.tag] ?? String(axis.default)}
                          onChange={(e) =>
                            handleAxisInputChange(axis.tag, e.target.value)
                          }
                          onBlur={() => handleAxisInputBlur(axis.tag)}
                          min={axis.min}
                          max={axis.max}
                          step={axis.tag === "ital" ? 1 : 0.1}
                          className="w-24 rounded-[10px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Metadata */}
              {metadata && (
                <Card className="rounded-[12px] border border-border bg-card p-7">
                  <Label className="text-[13px] uppercase text-muted-foreground">
                    Font Metadata
                  </Label>

                  <div className="mt-5 text-sm">
                    <div className="flex justify-between border-b border-border py-3">
                      <span className="text-muted-foreground">File Name</span>
                      <span className="font-medium">{metadata.name}</span>
                    </div>

                    <div className="flex justify-between border-b border-border py-3">
                      <span className="text-muted-foreground">Version</span>
                      <span className="font-medium">{metadata.version}</span>
                    </div>

                    <div className="flex justify-between border-b border-border py-3">
                      <span className="text-muted-foreground">Designer</span>
                      <span className="font-medium">{metadata.designer}</span>
                    </div>

                    <div className="flex justify-between border-b border-border py-3">
                      <span className="text-muted-foreground">File Size</span>
                      <span className="font-medium">
                        {(metadata.fileSize / 1024).toFixed(2)} KB
                      </span>
                    </div>

                    <div className="flex justify-between py-3">
                      <span className="text-muted-foreground">Axes</span>
                      <span className="font-medium">
                        {metadata.axes.map((a) => a.tag).join(", ")}
                      </span>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            <Card className="rounded-[12px] border border-border bg-card p-7">
              <Label className="text-[13px] uppercase text-muted-foreground">
                Preview
              </Label>

              <div
                className="mt-4 h-[320px] rounded-[12px] border border-border bg-muted/20 p-5"
                style={{
                  fontFamily,
                  fontSize: `${fontSize}px`,
                  fontVariationSettings,
                  lineHeight: 1.4,
                }}
              >
                <Textarea
                  className="h-full w-full resize-none bg-transparent border-none p-0 outline-none"
                  style={{
                    fontFamily,
                    fontSize: `${fontSize}px`,
                    fontVariationSettings,
                    lineHeight: 1.4,
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
        <DialogContent className="rounded-[16px] border border-border bg-card">
          <DialogHeader>
            <DialogTitle>Not a Variable Font</DialogTitle>
            <DialogDescription>
              This file does not contain any variable axes.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end pt-2">
            <Button onClick={() => setShowModal(false)}>OK</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
