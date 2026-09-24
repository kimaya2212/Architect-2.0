import React, { useRef, useState } from "react";
import {
  ChevronLeft, ChevronRight, RotateCw, Monitor, Tablet, Smartphone,
  MousePointerClick, ExternalLink, Maximize2, ChevronDown, Type, Palette, Trash2, Maximize,
} from "lucide-react";
import { MiniApp } from "@/components/workspace/MiniApp";
import { Segmented } from "@/components/ds/Segmented";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DEVICES = { desktop: "100%", tablet: 768, mobile: 390 };
const ROUTES = ["/", "/dashboard", "/settings"];

export function PreviewTab({ variant, building, status, progress, revealed, onElementSelect }) {
  const [device, setDevice] = useState("desktop");
  const [route, setRoute] = useState("/");
  const [selectMode, setSelectMode] = useState(false);
  const [popover, setPopover] = useState(null); // {x,y,label}
  const surfaceRef = useRef(null);

  const width = DEVICES[device];

  const onSurfaceClick = (e) => {
    if (!selectMode) return;
    const rect = surfaceRef.current.getBoundingClientRect();
    const labels = ["Heading", "KPI card", "Revenue chart", "Customers table", "Primary button", "Hero section"];
    const label = labels[Math.floor(Math.random() * labels.length)];
    setPopover({ x: e.clientX - rect.left, y: e.clientY - rect.top, label });
  };

  const quickAction = (action) => {
    onElementSelect?.(`${popover.label}`, action);
    setPopover(null);
    setSelectMode(false);
  };

  return (
    <div className="flex h-full flex-col bg-ac-base">
      {/* toolbar */}
      <div className="flex items-center gap-2 border-b border-ac-line px-3 py-2">
        <div className="flex items-center">
          <button className="rounded-[6px] p-1.5 text-ac-text-muted hover:bg-ac-elevated hover:text-ac-text" aria-label="Back"><ChevronLeft className="h-4 w-4" strokeWidth={1.5} /></button>
          <button className="rounded-[6px] p-1.5 text-ac-text-muted hover:bg-ac-elevated hover:text-ac-text" aria-label="Forward"><ChevronRight className="h-4 w-4" strokeWidth={1.5} /></button>
          <button className="rounded-[6px] p-1.5 text-ac-text-muted hover:bg-ac-elevated hover:text-ac-text" aria-label="Reload" data-testid="preview-reload"><RotateCw className="h-4 w-4" strokeWidth={1.5} /></button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-8 items-center gap-2 rounded-[6px] border border-ac-line bg-ac-surface px-3 font-mono text-[12px] text-ac-text-secondary hover:border-ac-line-strong" data-testid="route-switcher">
              app.preview{route}
              <ChevronDown className="h-3 w-3 text-ac-text-muted" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="border-ac-line bg-ac-elevated">
            {ROUTES.map((r) => <DropdownMenuItem key={r} className="font-mono text-ac-text-secondary" onClick={() => setRoute(r)}>{r}</DropdownMenuItem>)}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => { setSelectMode((s) => !s); setPopover(null); }}
            className={`flex h-8 items-center gap-1.5 rounded-[6px] border px-2.5 text-[12px] font-medium transition-colors ${selectMode ? "border-ac-accent text-ac-accent" : "border-ac-line text-ac-text-secondary hover:text-ac-text"}`}
            data-testid="select-element-btn"
          >
            <MousePointerClick className="h-3.5 w-3.5" strokeWidth={1.5} /> Select
          </button>
          <Segmented
            testId="device-toggle" size="sm" value={device} onChange={setDevice}
            options={[
              { value: "desktop", icon: <Monitor className="h-3.5 w-3.5" /> },
              { value: "tablet", icon: <Tablet className="h-3.5 w-3.5" /> },
              { value: "mobile", icon: <Smartphone className="h-3.5 w-3.5" /> },
            ]}
          />
          <button className="rounded-[6px] p-1.5 text-ac-text-muted hover:bg-ac-elevated hover:text-ac-text" aria-label="Open in new tab"><ExternalLink className="h-4 w-4" strokeWidth={1.5} /></button>
          <button className="rounded-[6px] p-1.5 text-ac-text-muted hover:bg-ac-elevated hover:text-ac-text" aria-label="Fullscreen"><Maximize2 className="h-4 w-4" strokeWidth={1.5} /></button>
        </div>
      </div>

      {/* progress bar */}
      {building && (
        <div className="h-0.5 w-full bg-ac-elevated">
          <div className="h-full bg-ac-accent transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* preview surface */}
      <div className="relative flex-1 overflow-auto bg-[color-mix(in_srgb,var(--ac-text-muted)_6%,transparent)] p-6">
        <div
          ref={surfaceRef}
          onClick={onSurfaceClick}
          className={`relative mx-auto overflow-hidden rounded-[10px] border border-ac-line bg-white shadow-float transition-[max-width] duration-300 ${selectMode ? "cursor-crosshair" : ""}`}
          style={{ maxWidth: width, minHeight: 400 }}
          data-testid="preview-surface"
        >
          {status === "idle" || status === "planning" ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 bg-ac-base p-8 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-ac-line bg-ac-elevated"><MousePointerClick className="h-5 w-5 text-ac-text-muted" strokeWidth={1.5} /></div>
              <p className="text-[14px] text-ac-text-secondary">Your app will appear here</p>
              <p className="max-w-xs text-[13px] text-ac-text-muted">Approve the plan in chat and I'll build it section by section, live.</p>
            </div>
          ) : (
            <MiniApp variant={variant} revealed={building ? revealed : 99} route={route} />
          )}
          {selectMode && <div className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-ac-accent/40" />}
          {popover && (
            <div className="absolute z-20 w-60 animate-scale-in rounded-[10px] border border-ac-line bg-ac-elevated p-3 shadow-float" style={{ left: Math.min(popover.x, 320), top: popover.y }} data-testid="element-popover">
              <div className="mb-2 flex items-center gap-1.5 text-[12px] font-medium text-ac-accent"><span className="h-1.5 w-1.5 rounded-full bg-ac-accent" /> Editing: {popover.label}</div>
              <input autoFocus placeholder="Describe a change…" onKeyDown={(e) => e.key === "Enter" && quickAction("edit")} className="focus-ring h-8 w-full rounded-[6px] border border-ac-line bg-ac-surface px-2 text-[12px] text-ac-text" data-testid="element-change-input" />
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {[{ i: Type, l: "Change text" }, { i: Palette, l: "Change color" }, { i: Maximize, l: "Make bigger" }, { i: Trash2, l: "Delete" }].map((a) => (
                  <button key={a.l} onClick={() => quickAction(a.l)} className="flex items-center gap-1.5 rounded-[6px] border border-ac-line px-2 py-1.5 text-[11px] text-ac-text-secondary hover:bg-ac-surface hover:text-ac-text"><a.i className="h-3 w-3" strokeWidth={1.5} /> {a.l}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
