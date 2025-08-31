"use client";

import * as React from "react";

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

const SAMPLE_TEXTS = {
  title: "ABCDEFGHIJKLMN\nOPQRSTUVWXYZ\n0123456789",
  pangram: "The quick brown fox jumps over the lazy dog 0123456789",
  paragraph:
    "Almost before we knew it, we had left the ground. The quick brown fox jumps over the lazy dog.",
  wikipedia:
    "Variable fonts are an evolution of the OpenType font specification that allow a single font file to behave like multiple fonts.",
} as const;

const VIEW_MODES = [
  "Plain",
  "Waterfall",
  "Styles",
  "Glyphs",
  "Present",
] as const;
type ViewMode = (typeof VIEW_MODES)[number];

export default function VariableFontPlayground() {
  const [viewMode, setViewMode] = React.useState<ViewMode>("Plain");

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

  const handlePresetClick = (key: keyof typeof SAMPLE_TEXTS) => {
    setPreviewText(SAMPLE_TEXTS[key]);
  };

  const handleCopyCss = React.useCallback(() => {
    if (!fontFamily) return;

    const css = [
      `font-family: "${fontFamily}";`,
      `font-size: ${fontSize}px;`,
      fontVariationSettings &&
        `font-variation-settings: ${fontVariationSettings};`,
    ]
      .filter(Boolean)
      .join("\n");

    void navigator.clipboard?.writeText(css);
  }, [fontFamily, fontSize, fontVariationSettings]);

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <aside className="border-b border-border bg-card/60 backdrop-blur md:w-[320px] md:border-b-0 md:border-r">
        <div className="flex h-full flex-col">
          <div className="border-b border-border px-4 py-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-[0.08em]">
                  Font
                </p>
                <p className="mt-1 truncate text-sm font-semibold">
                  {metadata?.name ?? "No font loaded"}
                </p>
                {metadata?.version && (
                  <p className="text-xs text-muted-foreground">
                    v{metadata.version}
                  </p>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="rounded-[10px]"
                onClick={() => setShowUploadModal(true)}
              >
                Upload
              </Button>
            </div>

            <FontUploadDialog
              open={showUploadModal}
              onOpenChange={setShowUploadModal}
              onFontLoaded={handleFontLoaded}
            />
          </div>

          <div className="border-b border-border px-4 py-4">
            <Label className="text-[11px] font-medium uppercase text-muted-foreground tracking-[0.12em]">
              Sample text
            </Label>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 rounded-full px-3 text-xs"
                onClick={() => handlePresetClick("title")}
              >
                Title
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 rounded-full px-3 text-xs"
                onClick={() => handlePresetClick("pangram")}
              >
                Pangram
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 rounded-full px-3 text-xs"
                onClick={() => handlePresetClick("paragraph")}
              >
                Paragraph
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 rounded-full px-3 text-xs"
                onClick={() => handlePresetClick("wikipedia")}
              >
                Wikipedia
              </Button>
            </div>
          </div>

          {/* Font size */}
          <div className="border-b border-border px-4 py-4">
            <Label className="text-[11px] font-medium uppercase text-muted-foreground tracking-[0.12em]">
              Size
            </Label>

            <div className="mt-3 flex items-center gap-4">
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
                className="w-20 rounded-[10px] h-8"
                value={fontSizeInput}
                onChange={(e) => handleFontSizeInputChange(e.target.value)}
                onBlur={handleFontSizeInputBlur}
              />
            </div>
          </div>

          {/* Variable axes */}
          <div className="flex-1 px-4 py-4">
            <Label className="text-[11px] font-medium uppercase text-muted-foreground tracking-[0.12em]">
              Variable axes
            </Label>

            <div className="mt-3 max-h-full space-y-4 overflow-y-auto pr-1">
              {axes.map((axis) => (
                <div key={axis.tag} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-semibold uppercase">
                      {axis.tag}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {axis.min} – {axis.max}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
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
                      className="w-20 rounded-[10px] h-8"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {metadata && (
            <div className="border-t border-border px-4 py-3 text-xs">
              {fontFile && (
                <p className="truncate">
                  <span className="text-muted-foreground">File:</span>{" "}
                  <span className="font-medium">{fontFile.name}</span>
                </p>
              )}

              {axes.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="text-muted-foreground">Axes:</span>
                  {axes.map((a) => (
                    <Badge
                      key={a.tag}
                      variant="outline"
                      className="px-1 py-0 text-[10px]"
                    >
                      {a.tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 flex-1 rounded-[10px] text-xs"
                  onClick={handleCopyCss}
                >
                  Copy CSS
                </Button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT MAIN AREA */}
      <main className="flex flex-1 flex-col">
        {/* Top app bar */}
        <header className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Variable Font Playground
            </h1>
            <p className="text-xs text-muted-foreground">
              Explore variable axes and generate usable CSS.
            </p>
          </div>
          <ModeToggle />
        </header>

        {/* Top info strip */}
        <div className="border-b border-border px-6 py-2 text-xs text-muted-foreground flex items-center justify-between gap-2">
          <div className="truncate">
            {fontFamily ? (
              <>
                <span className="font-medium">{fontFamily}</span>
                {metadata?.designer && ` · ${metadata.designer}`}
                {metadata?.axes?.length
                  ? ` · ${metadata.axes.length} axes`
                  : null}
              </>
            ) : (
              <span>No font loaded</span>
            )}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.12em]">
              View
            </span>
            {VIEW_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`rounded-full px-3 py-1 text-[11px] ${
                  viewMode === mode
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Preview area */}
        <section className="flex-1 overflow-auto bg-muted/30">
          <div className="mx-auto flex max-w-[1100px] flex-col px-6 py-8">
            {fontLoaded ? (
              <Card className="min-h-[60vh] border-none bg-background shadow-none">
                <Textarea
                  className="h-full min-h-[60vh] w-full resize-none border-none bg-transparent p-0 text-left text-4xl leading-tight outline-none"
                  style={{
                    fontFamily,
                    fontSize: `${fontSize}px`,
                    fontVariationSettings,
                    lineHeight: 1.4,
                  }}
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                />
              </Card>
            ) : (
              <div className="flex h-full min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
                Upload a variable font on the left to start.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
