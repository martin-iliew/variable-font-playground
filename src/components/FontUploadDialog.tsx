"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

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
  fileSize: number;
  axes: VariableAxis[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  onFontLoaded: (data: {
    file: File;
    fontFamily: string;
    axes: VariableAxis[];
    metadata: FontMetadata;
  }) => void;
}

export function FontUploadDialog({ open, onOpenChange, onFontLoaded }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [invalidDialogOpen, setInvalidDialogOpen] = useState(false);

  const handleInvalidFont = () => {
    setInvalidDialogOpen(true);
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
        const { axes, metadata } = await res.json();

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

        onOpenChange(false);
      } catch (err) {
        console.error(err);
        handleInvalidFont();
      }
    },
    [onFontLoaded, onOpenChange],
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="border-border bg-card max-w-xl rounded-[16px] border">
          <DialogHeader>
            <DialogTitle>Upload a Variable Font</DialogTitle>
            <DialogDescription>Supported: .ttf, .otf</DialogDescription>
          </DialogHeader>

          <div
            className={`relative mt-3 flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed transition-all ${
              isDragging
                ? "border-foreground bg-muted/30"
                : "border-border bg-muted/10"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={handleDrop}
            onClick={() => document.getElementById("upload-input")?.click()}
          >
            <Upload className="text-muted-foreground mb-4 h-8 w-8" />
            <p className="text-muted-foreground mb-2">
              Drag & drop, or click to choose
            </p>

            <Button variant="outline">Choose File</Button>

            <input
              id="upload-input"
              type="file"
              accept=".ttf,.otf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
              }}
            />
          </div>

          {selectedFile && (
            <p className="text-muted-foreground mt-3 text-sm break-all">
              Selected: <span className="font-medium">{selectedFile.name}</span>
            </p>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={invalidDialogOpen} onOpenChange={setInvalidDialogOpen}>
        <DialogContent className="border-border bg-card rounded-[16px] border">
          <DialogHeader>
            <DialogTitle>Not a Variable Font</DialogTitle>
            <DialogDescription>
              This file does not contain any variable axes.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end pt-2">
            <Button onClick={() => setInvalidDialogOpen(false)}>OK</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
