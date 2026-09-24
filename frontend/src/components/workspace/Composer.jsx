import React, { useState } from "react";
import { toast } from "sonner";
import { Paperclip, ArrowUp, Square, X, ChevronDown, Hammer, MessageCircleQuestion, Bug } from "lucide-react";
import { MODELS } from "@/lib/mockData";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CHAT_MODES = [
  { id: "build", label: "Build", icon: Hammer },
  { id: "ask", label: "Ask", icon: MessageCircleQuestion },
  { id: "debug", label: "Debug", icon: Bug },
];

const SLASH = ["/plan", "/fix", "/explain", "/deploy", "/rollback"];

export function Composer({ onSend, building, onStop, elementChip, onClearChip, pro }) {
  const [value, setValue] = useState("");
  const [chatMode, setChatMode] = useState("build");
  const [model, setModel] = useState(MODELS[0]);
  const [showSlash, setShowSlash] = useState(false);

  const send = () => {
    if (!value.trim() || building) return;
    onSend(value.trim(), { chatMode, model });
    setValue("");
    setShowSlash(false);
  };
  const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };
  const onChange = (e) => { const v = e.target.value; setValue(v); setShowSlash(v === "/"); };

  const ModeIcon = CHAT_MODES.find((m) => m.id === chatMode).icon;

  return (
    <div className="border-t border-ac-line bg-ac-base p-3">
      {elementChip && (
        <div className="mb-2 flex w-fit items-center gap-2 rounded-[6px] border border-ac-accent/40 bg-[color-mix(in_srgb,var(--ac-accent)_10%,transparent)] px-2.5 py-1 text-[12px] text-ac-accent" data-testid="element-chip">
          <span className="h-1.5 w-1.5 rounded-full bg-ac-accent" /> Editing: {elementChip}
          <button onClick={onClearChip} className="text-ac-accent/70 hover:text-ac-accent"><X className="h-3 w-3" /></button>
        </div>
      )}
      <div className="rounded-[12px] border border-ac-line-strong bg-ac-surface p-2 transition-shadow focus-within:ring-1 focus-within:ring-ac-accent/40">
        {showSlash && (
          <div className="mb-2 flex flex-wrap gap-1.5 border-b border-ac-line pb-2">
            {SLASH.map((s) => (
              <button key={s} onClick={() => { setValue(s + " "); setShowSlash(false); }} className="rounded-[5px] bg-ac-elevated px-2 py-1 font-mono text-[11px] text-ac-text-secondary hover:text-ac-text">{s}</button>
            ))}
          </div>
        )}
        <textarea
          value={value}
          onChange={onChange}
          onKeyDown={onKey}
          rows={2}
          placeholder={chatMode === "build" ? "Describe a change, or type / for commands…" : chatMode === "ask" ? "Ask anything about your app…" : "Describe the bug you're seeing…"}
          className="w-full resize-none bg-transparent px-1.5 pt-1 text-[14px] leading-relaxed text-ac-text outline-none placeholder:text-ac-text-muted"
          data-testid="composer-input"
        />
        <div className="mt-1 flex items-center gap-2">
          <button onClick={() => toast("Attach", { description: "Attach files, a screenshot or a URL." })} className="rounded-[6px] p-1.5 text-ac-text-muted hover:bg-ac-elevated hover:text-ac-text" aria-label="Attach"><Paperclip className="h-4 w-4" strokeWidth={1.5} /></button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex h-7 items-center gap-1.5 rounded-[6px] border border-ac-line px-2 text-[12px] font-medium text-ac-text-secondary hover:text-ac-text" data-testid="chat-mode-chip"><ModeIcon className="h-3.5 w-3.5" strokeWidth={1.5} /> {CHAT_MODES.find((m) => m.id === chatMode).label}</button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="border-ac-line bg-ac-elevated">
              {CHAT_MODES.map((m) => <DropdownMenuItem key={m.id} className="text-ac-text-secondary" onClick={() => setChatMode(m.id)}><m.icon className="mr-2 h-4 w-4" /> {m.label}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex h-7 items-center gap-1 rounded-[6px] border border-ac-line px-2 text-[12px] text-ac-text-muted hover:text-ac-text-secondary" data-testid="composer-model"><span className="max-w-[110px] truncate">{model}</span><ChevronDown className="h-3 w-3" /></button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="border-ac-line bg-ac-elevated">
              {MODELS.map((m) => <DropdownMenuItem key={m} className="text-ac-text-secondary" onClick={() => setModel(m)}>{m}</DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="ml-auto">
            {building ? (
              <button onClick={onStop} className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-ac-line text-ac-text-secondary hover:text-ac-text" aria-label="Stop" data-testid="composer-stop"><Square className="h-3.5 w-3.5" fill="currentColor" /></button>
            ) : (
              <button onClick={send} className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-ac-accent text-ac-accent-text transition-colors hover:bg-ac-accent-hover disabled:opacity-40" disabled={!value.trim()} aria-label="Send" data-testid="composer-send"><ArrowUp className="h-4 w-4" strokeWidth={2} /></button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
