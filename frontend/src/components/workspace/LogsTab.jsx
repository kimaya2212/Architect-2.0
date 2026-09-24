import React, { useEffect, useRef, useState } from "react";
import { Pause, Play, Search } from "lucide-react";
import { mockLogs } from "@/lib/aiEngine";

const LEVEL = { info: "text-ac-info", warn: "text-ac-warning", error: "text-ac-danger" };

export function LogsTab() {
  const [logs, setLogs] = useState(mockLogs());
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    if (paused) return;
    const extra = [
      { level: "info", msg: "GET /api/customers 200 in 19ms" },
      { level: "info", msg: "Hot reload: app/dashboard/page.tsx" },
      { level: "warn", msg: "Slow query: select * from events (287ms)" },
      { level: "info", msg: "GET /dashboard 200 in 61ms" },
    ];
    const t = setInterval(() => {
      const e = extra[Math.floor(Math.random() * extra.length)];
      const ts = new Date().toLocaleTimeString("en-GB");
      setLogs((l) => [...l.slice(-80), { ...e, ts }]);
    }, 2200);
    return () => clearInterval(t);
  }, [paused]);

  useEffect(() => { if (!paused) endRef.current?.scrollIntoView(); }, [logs, paused]);

  const shown = logs.filter((l) => (filter === "all" || l.level === filter) && (!q || l.msg.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="flex h-full flex-col bg-ac-base">
      <div className="flex items-center gap-2 border-b border-ac-line px-3 py-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ac-text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter logs" className="focus-ring h-8 w-48 rounded-[6px] border border-ac-line bg-ac-surface pl-8 pr-2 text-[12px] text-ac-text" data-testid="logs-search" />
        </div>
        <div className="flex gap-1">
          {["all", "info", "warn", "error"].map((lv) => (
            <button key={lv} onClick={() => setFilter(lv)} className={`h-7 rounded-[6px] px-2 text-[11px] font-medium capitalize ${filter === lv ? "bg-ac-elevated text-ac-text" : "text-ac-text-muted hover:text-ac-text-secondary"}`} data-testid={`log-filter-${lv}`}>{lv}</button>
          ))}
        </div>
        <button onClick={() => setPaused((p) => !p)} className="ml-auto flex h-7 items-center gap-1.5 rounded-[6px] border border-ac-line px-2 text-[11px] text-ac-text-secondary hover:text-ac-text" data-testid="logs-pause">
          {paused ? <><Play className="h-3 w-3" /> Resume</> : <><Pause className="h-3 w-3" /> Pause</>}
        </button>
      </div>
      <div className="flex-1 overflow-auto p-3 font-mono text-[12px] leading-relaxed">
        {shown.map((l, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-ac-text-muted">{l.ts}</span>
            <span className={`w-10 uppercase ${LEVEL[l.level]}`}>{l.level}</span>
            <span className="text-ac-text-secondary">{l.msg}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}
