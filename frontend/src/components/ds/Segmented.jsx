import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Segmented({ options, value, onChange, size = "md", className, testId }) {
  const h = size === "sm" ? "h-8" : "h-9";
  const pad = size === "sm" ? "px-3 text-[13px]" : "px-3.5 text-[13px]";
  return (
    <div
      className={cn("relative inline-flex items-center rounded-[8px] border border-ac-line bg-ac-elevated p-0.5", h, className)}
      data-testid={testId}
      role="tablist"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            data-testid={`segment-${opt.value}`}
            className={cn(
              "relative z-10 inline-flex items-center gap-1.5 rounded-[6px] font-medium transition-colors duration-150",
              pad,
              active ? "text-ac-text" : "text-ac-text-muted hover:text-ac-text-secondary"
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${testId || "x"}`}
                className="absolute inset-0 -z-10 rounded-[6px] bg-ac-surface border border-ac-line-strong shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
