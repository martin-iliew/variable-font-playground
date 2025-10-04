"use client";

import * as React from "react";
import { useState, useCallback, useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";

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
  fileSize: number;
  axes: VariableAxis[];
}

export interface FontDropzoneResult {
  file: File;
  fontFamily: string;
  axes: VariableAxis[];
  metadata: FontMetadata;
}

interface FontDropzoneProps {
  onFontLoaded: (data: FontDropzoneResult) => void;
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function FontDropzone({
  onFontLoaded,
  className = "",
}: FontDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleInvalidFont = () => {
    toast.error("Invalid font file");

    setSelectedFile(null);
  };

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".ttf") && !file.name.endsWith(".otf")) {
        handleInvalidFont();
        return;
      }

      setSelectedFile(file);

      try {
        const form = new FormData();
        form.append("file", file);

        const res = await fetch("/api/axes", { method: "POST", body: form });
        const { axes, metadata } = (await res.json()) as {
          axes: VariableAxis[];
          metadata?: Partial<FontMetadata>;
        };

        if (!axes || axes.length === 0) {
          handleInvalidFont();
          return;
        }

        const buffer = await file.arrayBuffer();
        const fontName =
          metadata?.name ||
          file.name.replace(/\.[^/.]+$/, "") ||
          "UploadedFont";

        const fontFace = new FontFace(fontName, buffer);
        await fontFace.load();
        document.fonts.add(fontFace);

        const finalMetadata: FontMetadata = {
          name: metadata?.name || file.name.replace(/\.[^/.]+$/, ""),
          version: metadata?.version || undefined,
          designer: metadata?.designer || undefined,
          fileSize: file.size,
          axes,
        };

        onFontLoaded({
          file,
          fontFamily: fontName,
          axes,
          metadata: finalMetadata,
        });
      } catch (err) {
        console.error(err);
        handleInvalidFont();
      }
    },
    [onFontLoaded],
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) void handleFileSelect(file);
  };

  return (
    <>
      <div
        className={`relative flex cursor-pointer flex-col items-center justify-center border-2 border-dashed p-6 transition-all ${
          isDragging
            ? "border-foreground bg-muted/30"
            : "border-border bg-muted/10"
        } ${className}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="text-muted-foreground mb-4 h-8 w-8" />
        <p className="text-muted-foreground mb-2 text-sm">
          Drag & drop, or click to choose
        </p>

        <Button variant="outline" className="rounded-[10px]">
          Choose File
        </Button>

        <input
          ref={inputRef}
          type="file"
          accept=".ttf,.otf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFileSelect(f);
          }}
        />
      </div>

      {selectedFile && (
        <p className="text-muted-foreground mt-3 text-sm break-all">
          Selected: <span className="font-medium">{selectedFile.name}</span>
        </p>
      )}
    </>
  );
}
