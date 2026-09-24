import React from "react";
import { cn } from "@/lib/utils";

const STATUS = {
  live: { label: "Live", cls: "text-ac-success", dot: "bg-ac-success", bg: "bg-[color-mix(in_srgb,var(--ac-success)_12%,transparent)]" },
  building: { label: "Building", cls: "text-ac-warning", dot: "bg-ac-warning animate-pulse", bg: "bg-[color-mix(in_srgb,var(--ac-warning)_12%,transparent)]" },
  draft: { label: "Draft", cls: "text-ac-text-secondary", dot: "bg-ac-text-muted", bg: "bg-ac-elevated" },
  failed: { label: "Failed", cls: "text-ac-danger", dot: "bg-ac-danger", bg: "bg-[color-mix(in_srgb,var(--ac-danger)_12%,transparent)]" },
};

export function StatusChip({ status = "draft", className }) {
  const s = STATUS[status] || STATUS.draft;
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-[6px] px-2 h-6 text-[12px] font-medium", s.bg, s.cls, className)}
      data-testid={`status-chip-${status}`}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}
