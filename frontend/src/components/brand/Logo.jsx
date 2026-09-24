import React from "react";
import { cn } from "@/lib/utils";

export function Logo({ className, showWord = true, size = 20 }) {
  return (
    <span className={cn("inline-flex items-center gap-2 select-none", className)}>
      <span
        className="relative inline-flex items-center justify-center rounded-[7px] bg-ac-accent"
        style={{ width: size + 8, height: size + 8 }}
      >
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3L4 20h4l1.6-4h4.8l1.6 4h4L12 3z" fill="#0B0C0E" />
          <path d="M10.4 13h3.2L12 8.8 10.4 13z" fill="#6EE7B7" />
        </svg>
      </span>
      {showWord && (
        <span className="font-semibold tracking-[-0.02em] text-ac-text" style={{ fontSize: 16 }}>
          Architect
        </span>
      )}
    </span>
  );
}
