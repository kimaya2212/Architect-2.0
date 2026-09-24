import React from "react";
import { cn } from "@/lib/utils";

const ACCENTS = {
  emerald: ["#6EE7B7", "#34D399"],
  blue: ["#60A5FA", "#2563EB"],
  amber: ["#FBBF24", "#D97706"],
  rose: ["#F87171", "#E11D48"],
  violet: ["#A78BFA", "#7C3AED"],
  cyan: ["#67E8F9", "#0891B2"],
};

// Deterministic, purely CSS/SVG generated thumbnail per project (no broken image links)
export function ProjectThumb({ accent = "emerald", type = "web", className }) {
  const [c1, c2] = ACCENTS[accent] || ACCENTS.emerald;
  return (
    <div className={cn("relative w-full overflow-hidden rounded-[8px] border border-ac-line bg-ac-base", className)}>
      <div className="absolute inset-0 opacity-[0.5]" style={{ background: `radial-gradient(120% 80% at 0% 0%, ${c1}22, transparent 60%)` }} />
      {/* mini browser chrome */}
      <div className="absolute left-0 right-0 top-0 flex h-5 items-center gap-1 border-b border-ac-line bg-ac-surface px-2">
        <span className="h-1.5 w-1.5 rounded-full bg-ac-text-muted/50" />
        <span className="h-1.5 w-1.5 rounded-full bg-ac-text-muted/40" />
        <span className="h-1.5 w-1.5 rounded-full bg-ac-text-muted/30" />
      </div>
      <div className="absolute inset-0 top-5 p-2.5">
        {type === "agent" ? (
          <div className="flex h-full flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <span className="h-4 w-4 rounded-[4px]" style={{ background: c1 }} />
              <span className="h-2 w-14 rounded bg-ac-line-strong" />
            </div>
            <div className="mt-1 flex flex-1 gap-1.5">
              <div className="flex-1 rounded-[5px] border border-ac-line bg-ac-surface p-1.5">
                <div className="h-1.5 w-3/4 rounded bg-ac-line-strong" />
                <div className="mt-1 h-1.5 w-1/2 rounded bg-ac-line" />
                <div className="mt-2 h-1.5 w-2/3 rounded bg-ac-line" />
              </div>
              <div className="w-1/3 rounded-[5px] border border-ac-line bg-ac-surface p-1.5">
                <div className="h-1.5 w-full rounded" style={{ background: c2 }} />
                <div className="mt-1 h-1.5 w-3/4 rounded bg-ac-line" />
                <div className="mt-1 h-1.5 w-2/3 rounded bg-ac-line" />
              </div>
            </div>
          </div>
        ) : type === "mobile" ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-full w-1/2 rounded-[6px] border border-ac-line bg-ac-surface p-1.5">
              <div className="h-2 w-2/3 rounded" style={{ background: c1 }} />
              <div className="mt-1.5 h-1.5 w-full rounded bg-ac-line" />
              <div className="mt-1 h-1.5 w-3/4 rounded bg-ac-line" />
              <div className="mt-2 h-6 w-full rounded-[4px] bg-ac-elevated" />
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col gap-1.5">
            <div className="flex gap-1.5">
              <div className="flex-1 rounded-[5px] border border-ac-line bg-ac-surface p-1.5">
                <div className="h-1.5 w-1/2 rounded bg-ac-line" />
                <div className="mt-1 h-3 w-2/3 rounded" style={{ background: c1 }} />
              </div>
              <div className="flex-1 rounded-[5px] border border-ac-line bg-ac-surface p-1.5">
                <div className="h-1.5 w-1/2 rounded bg-ac-line" />
                <div className="mt-1 h-3 w-1/2 rounded" style={{ background: c2 }} />
              </div>
            </div>
            <div className="flex flex-1 items-end gap-1 rounded-[5px] border border-ac-line bg-ac-surface p-1.5">
              {[40, 65, 50, 80, 60, 90, 72].map((h, i) => (
                <span key={i} className="flex-1 rounded-[2px]" style={{ height: `${h}%`, background: i % 2 ? c2 : c1, opacity: 0.85 }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
