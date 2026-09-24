import React from "react";
import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-ac-elevated text-ac-text-secondary border-ac-line",
  accent: "bg-[color-mix(in_srgb,var(--ac-accent)_14%,transparent)] text-ac-accent border-transparent",
  info: "bg-[color-mix(in_srgb,var(--ac-info)_14%,transparent)] text-ac-info border-transparent",
  warning: "bg-[color-mix(in_srgb,var(--ac-warning)_14%,transparent)] text-ac-warning border-transparent",
  danger: "bg-[color-mix(in_srgb,var(--ac-danger)_14%,transparent)] text-ac-danger border-transparent",
  outline: "bg-transparent text-ac-text-secondary border-ac-line",
};

export function Badge({ tone = "neutral", className, children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[6px] border px-2 h-6 text-[12px] font-medium",
        tones[tone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
