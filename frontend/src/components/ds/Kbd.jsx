import React from "react";
import { cn } from "@/lib/utils";

export function Kbd({ children, className }) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-[5px] border border-ac-line bg-ac-elevated text-ac-text-muted font-mono text-[11px] leading-none",
        className
      )}
    >
      {children}
    </kbd>
  );
}
