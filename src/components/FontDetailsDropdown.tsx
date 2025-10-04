"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface Axis {
  tag: string;
}

interface FontDetailsDropdownProps {
  trigger: React.ReactNode;

  metadata: {
    name: string;
    version?: string;
    designer?: string;
    fileSize: number;
    axes: Axis[];
  } | null;

  fileName?: string | null;
}

export function FontDetailsDropdown({
  trigger,
  metadata,
  fileName,
}: FontDetailsDropdownProps) {
  const axisCount = metadata?.axes?.length ?? 0;
  const fileSizeKB = metadata ? Math.round(metadata.fileSize / 1024) : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>

      <DropdownMenuContent className="border-border/80 bg-card w-80 rounded-[14px] border px-3 py-2.5  ">
        <DropdownMenuLabel className="px-1 pt-0 pb-1 text-sm font-semibold">
          Font Info
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {metadata ? (
          <div className="space-y-3 px-1 pt-1 pb-1 text-xs">
            <div className="space-y-1.5">
              {metadata.version && (
                <p>
                  <span className="text-muted-foreground">Version:</span>{" "}
                  <span className="font-medium">{metadata.version}</span>
                </p>
              )}

              {metadata.designer && (
                <p>
                  <span className="text-muted-foreground">Designer:</span>{" "}
                  <span>{metadata.designer}</span>
                </p>
              )}

              {fileName && (
                <p className="truncate">
                  <span className="text-muted-foreground">File:</span>{" "}
                  <span className="font-mono text-[11px]">{fileName}</span>
                </p>
              )}

              {fileSizeKB !== null && (
                <p>
                  <span className="text-muted-foreground">Size:</span>{" "}
                  {fileSizeKB} KB
                </p>
              )}

              {axisCount > 0 && (
                <p>
                  <span className="text-muted-foreground">Axes:</span>{" "}
                  {axisCount}
                </p>
              )}
            </div>

            {axisCount > 0 && (
              <div className="space-y-1.5">
                <p className="text-muted-foreground text-[11px] font-medium tracking-[0.14em] uppercase">
                  Axis tags
                </p>
                <div className="border-border/60 bg-muted/40 rounded-[10px] border px-2 py-1.5">
                  <div className="flex flex-wrap gap-1.5">
                    {metadata.axes.map((a) => (
                      <Badge
                        key={a.tag}
                        variant="outline"
                        className="border-border/70 bg-background/80 px-1.5 py-0 text-[10px]"
                      >
                        {a.tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground px-1 pt-1 pb-1 text-xs">
            Upload a variable font to see detailed metadata.
          </p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
