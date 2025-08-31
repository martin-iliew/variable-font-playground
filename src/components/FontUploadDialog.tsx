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
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

interface VariableAxis {
  tag: string;
  name: string;
  min: number;
  max: number;
  default: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  onFontLoaded: (data: {
    file: File;
    fontFamily: string;
    axes: VariableAxis[];
    metadata: {
      name: string;
      version: string;
      designer: string;
      fileSize: number;
      axes: VariableAxis[];
    };
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
        const { axes } = await res.json();

        if (!axes || axes.length === 0) {
          handleInvalidFont();
          return;
        }

        const buffer = await file.arrayBuffer();
        const fontName = `UploadedFont-${Date.now()}`;
        const fontFace = new FontFace(fontName, buffer);
        await fontFace.load();
        document.fonts.add(fontFace);

        onFontLoaded({
          file,
          fontFamily: fontName,
          axes,
          metadata: {
            name: file.name,
            version: "Unknown",
            designer: "Unknown",
            fileSize: file.size,
            axes,
          },
        });

        onOpenChange(false);
      } catch (err) {
        console.error(err);
        handleInvalidFont();
      }
    },
    [onFontLoaded, onOpenChange]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  return (
    <>
      {/* Main Upload Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl rounded-[16px] border border-border bg-card p-7">
          <DialogHeader>
            <DialogTitle>Upload a Variable Font</DialogTitle>
            <DialogDescription>Supported: .ttf, .otf</DialogDescription>
          </DialogHeader>

          <Label className="text-[13px] uppercase text-muted-foreground mt-3">
            Upload a variable font
          </Label>

          <div
            className={`relative flex min-h-[180px] flex-col items-center justify-center
              mt-3 rounded-[12px] border-2 border-dashed cursor-pointer transition-all
              ${
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
            <Upload className="mb-4 h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">
              Drag & drop, or click to choose
            </p>

            <Button variant="outline" className="rounded-[10px]">
              Choose File
            </Button>

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
            <p className="mt-3 text-sm text-muted-foreground break-all">
              Selected: <span className="font-medium">{selectedFile.name}</span>
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Invalid Font Dialog */}
      <Dialog open={invalidDialogOpen} onOpenChange={setInvalidDialogOpen}>
        <DialogContent className="rounded-[16px] border border-border bg-card">
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
