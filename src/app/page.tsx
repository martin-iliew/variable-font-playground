"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Badge } from "@/components/ui/badge";

import { FontUploadDialog } from "@/components/FontUploadDialog";
import { useVariableFontPlayground } from "@/hooks/useFontPlaygroundController";

export default function VariableFontPlayground() {
  const {
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

    fontVariationSettings,
  } = useVariableFontPlayground();

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
            <Button
              variant="outline"
              className="rounded-[10px] mt-6"
              onClick={() => setShowUploadModal(true)}
            >
              Upload Font
            </Button>
            <FontUploadDialog
              open={showUploadModal}
              onOpenChange={setShowUploadModal}
              onFontLoaded={handleFontLoaded}
            />
          </div>
          <ModeToggle />
        </div>

        {fontLoaded && (
          <div className="flex flex-col gap-7">
            <Card className="rounded-[12px] border border-border bg-card p-7">
              <div
                className=""
                style={{
                  fontFamily,
                  fontSize: `${fontSize}px`,
                  fontVariationSettings,
                  lineHeight: 1.4,
                }}
              >
                <Textarea
                  className="h-full w-full resize-none border-none shadow-none p-0 outline-none"
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
            <div className="grid gap-7 md:grid-cols-[1.2fr_1.1fr]">
              <div className="space-y-7">
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
                      onChange={(e) =>
                        handleFontSizeInputChange(e.target.value)
                      }
                      onBlur={handleFontSizeInputBlur}
                    />
                  </div>
                </Card>

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
                            onValueChange={([v]) =>
                              updateAxisValue(axis.tag, v)
                            }
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
                {metadata && (
                  <Card className="rounded-[12px] border border-border bg-card p-7">
                    {fontFile && (
                      <div className="mt-4 text-sm">
                        <p className="text-muted-foreground">Selected:</p>
                        <p className="font-medium break-all mt-1">
                          {fontFile.name}
                        </p>
                      </div>
                    )}

                    {axes.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
