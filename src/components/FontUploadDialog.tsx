"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FontDropzone,
  type FontDropzoneResult,
} from "@/components/FontDropzone";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFontLoaded: (data: FontDropzoneResult) => void;
}

export function FontUploadDialog({ open, onOpenChange, onFontLoaded }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card max-w-xl border">
        <DialogHeader>
          <DialogTitle>Upload a Variable Font</DialogTitle>
          <DialogDescription>Supported: .ttf, .otf</DialogDescription>
        </DialogHeader>

        <FontDropzone
          className="mt-3 min-h-[180px] rounded-md"
          onFontLoaded={(data) => {
            onFontLoaded(data);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
