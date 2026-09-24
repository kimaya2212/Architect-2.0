import React, { useState } from "react";
import { Check, ChevronRight, RotateCw, FileDiff } from "lucide-react";
import { cn } from "@/lib/utils";

function StepIcon({ state }) {
  if (state === "done") return <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--ac-success)_20%,transparent)]"><Check className="h-3 w-3 text-ac-success" strokeWidth={3} /></span>;
  if (state === "running") return <span className="flex h-5 w-5 items-center justify-center"><span className="h-4 w-4 animate-spin rounded-full border-2 border-ac-accent border-t-transparent" /></span>;
  if (state === "failed") return <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--ac-danger)_20%,transparent)]"><RotateCw className="h-3 w-3 text-ac-danger" /></span>;
  return <span className="flex h-5 w-5 items-center justify-center"><span className="h-2 w-2 rounded-full border border-ac-line-strong" /></span>;
}

export function BuildTimeline({ steps, filesChanged, completed, pro, onOpenDiff }) {
  const [open, setOpen] = useState({});
  return (
    <div className="rounded-[12px] border border-ac-line bg-ac-surface p-3" data-testid="build-timeline">
      <div className="mb-1 px-1 text-[12px] font-medium text-ac-text-secondary">{completed ? "Build complete" : "Building your app"}</div>
      <div className="relative">
        <div className="absolute bottom-3 left-[17px] top-3 w-px bg-ac-line" />
        {steps.map((s, i) => {
          const expandable = (s.sub?.length || 0) > 0 && s.state !== "pending";
          return (
            <div key={i} className="relative">
              <button
                onClick={() => expandable && setOpen((o) => ({ ...o, [i]: !o[i] }))}
                className={cn("flex w-full items-center gap-2.5 rounded-[6px] px-1 py-1.5 text-left", expandable && "hover:bg-ac-elevated")}
                data-testid={`build-step-${i}`}
              >
                <StepIcon state={s.state} />
                <span className={cn("text-[13px]", s.state === "pending" ? "text-ac-text-muted" : "text-ac-text")}>{s.label}</span>
                {s.state === "running" && <span className="text-[11px] text-ac-accent">running…</span>}
                {s.state === "done" && s.elapsed != null && <span className="text-[11px] text-ac-text-muted">{(s.elapsed / 1000).toFixed(1)}s</span>}
                {expandable && <ChevronRight className={cn("ml-auto h-3.5 w-3.5 text-ac-text-muted transition-transform", open[i] && "rotate-90")} />}
              </button>
              {open[i] && expandable && (
                <div className="animate-fade-in space-y-1 py-1 pl-9 pr-2">
                  {s.sub.map((t, j) => (
                    <div key={j} className="flex items-center gap-2 text-[12px] text-ac-text-muted"><span className="h-1 w-1 rounded-full bg-ac-text-muted" /> {t}</div>
                  ))}
                  {pro && s.files > 0 && <div className="font-mono text-[11px] text-ac-text-muted">{s.files} files touched</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {completed && filesChanged && (
        <button onClick={onOpenDiff} className="mt-2 flex w-full items-center gap-2 rounded-[8px] border border-ac-line bg-ac-base px-3 py-2 text-[12px] text-ac-text-secondary hover:border-ac-line-strong" data-testid="files-changed-chip">
          <FileDiff className="h-3.5 w-3.5 text-ac-text-muted" strokeWidth={1.5} />
          <span className="font-mono">{filesChanged.count} files</span>
          <span className="font-mono text-ac-success">+{filesChanged.added}</span>
          <span className="font-mono text-ac-danger">−{filesChanged.removed}</span>
          <span className="ml-auto text-ac-accent">{pro ? "View diff" : "See changes"}</span>
        </button>
      )}
    </div>
  );
}
