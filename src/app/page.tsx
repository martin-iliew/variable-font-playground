"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { FontDetailsDropdown } from "@/components/FontDetailsDropdown";
import { toast } from "sonner";
import { FontUploadDialog } from "@/components/FontUploadDialog";
import { useVariableFontPlayground } from "@/hooks/useFontPlaygroundController";
import { ChevronDown, Upload } from "lucide-react";
import { FontDropzone } from "@/components/FontDropzone";

export default function Page() {
  const {
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
  } = useVariableFontPlayground();

  return (
    <div className="bg-background flex min-h-screen flex-col md:flex-row">
      <aside className="border-border bg-card border-b backdrop-blur md:w-[320px] md:border-r md:border-b-0">
        <div className="flex h-full flex-col">
          <div className="border-border h-19 border-b px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-2">
                <div>
                  <p className="mt-1 truncate text-sm font-bold">
                    {metadata?.name ?? "No font loaded"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {metadata?.version ?? "No font loaded"}
                  </p>
                </div>
                <FontDetailsDropdown
                  trigger={
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowUploadModal(true)}
                    >
                      <ChevronDown className="text-muted-foreground" />
                    </Button>
                  }
                  metadata={metadata}
                  fileName={metadata?.name ?? null}
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowUploadModal(true)}
              >
                <Upload className="text-muted-foreground" />
              </Button>
            </div>

            <FontUploadDialog
              open={showUploadModal}
              onOpenChange={setShowUploadModal}
              onFontLoaded={handleFontLoaded}
            />
          </div>

          <div className="border-border border-b px-4 py-4">
            <Label className="text-muted-foreground text-sm font-medium">
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

          <div className="border-border border-b px-4 py-4">
            <Label className="text-muted-foreground text-sm font-medium">
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
                className="h-8 w-20 rounded-[10px]"
                value={fontSizeInput}
                onChange={(e) => handleFontSizeInputChange(e.target.value)}
                onBlur={handleFontSizeInputBlur}
              />
            </div>
          </div>

          <div className="mb-3 flex-1 px-4 py-4">
            <div className="flex justify-between">
              <Label className="text-muted-foreground text-sm font-medium">
                Variable axes
              </Label>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={resetAllAxes}
              >
                Reset
              </Button>
            </div>

            <div className="my-3 max-h-full space-y-4 overflow-y-auto">
              {axes.map((axis) => (
                <div key={axis.tag} className="mb-2">
                  <div className="flex items-center justify-between text-xs">
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
                      className="h-8 w-20 rounded-[10px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 px-4 pb-4">
            <Button
              size="sm"
              variant="outline"
              className="h-8 flex-1 rounded-[10px] text-xs"
              onClick={() => {
                toast("CSS copied", {
                  action: {
                    label: "Undo",
                    onClick: () => console.log("Undo"),
                  },
                });
                handleCopyCss();
              }}
            >
              Copy CSS
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        <div className="bg-card">
          <header className="border-border flex h-19 items-center justify-between border-b px-6 py-4">
            <div>
              <h1 className="title text-lg font-semibold tracking-tight">
                Variable Font Playground
              </h1>
              <p className="text-muted-foreground text-xs">
                Explore variable axes and generate usable CSS.
              </p>
            </div>
            <ModeToggle />
          </header>

          <div className="border-border text-muted-foreground flex items-center justify-between gap-2 border-b px-6 py-2 text-xs">
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
          </div>
        </div>

        <section className="flex-1">
          <div className="bg-muted dark:bg-secondary/30 mx-auto h-full w-full">
            {fontLoaded ? (
              <textarea
                className="h-full w-full resize-none border-none p-6 text-left leading-tight outline-none dark:bg-transparent"
                style={{
                  fontFamily,
                  fontSize: `${fontSize}px`,
                  fontVariationSettings,
                  lineHeight: 1.4,
                }}
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
              />
            ) : (
              <FontDropzone
                onFontLoaded={handleFontLoaded}
                className="h-full"
                height="100%"
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
