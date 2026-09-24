import React, { useEffect, useRef, useState } from "react";
import { runTerminal } from "@/lib/aiEngine";

export function TerminalTab() {
  const [lines, setLines] = useState([
    { t: "out", v: "Architect terminal — branch chat/session-1" },
    { t: "out", v: "Type 'help' for available commands." },
  ]);
  const [cmd, setCmd] = useState("");
  const [history, setHistory] = useState([]);
  const [hIdx, setHIdx] = useState(-1);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [lines]);

  const submit = () => {
    const c = cmd;
    const out = runTerminal(c);
    if (out === "__clear__") { setLines([]); setCmd(""); setHistory((h) => [...h, c]); setHIdx(-1); return; }
    setLines((l) => [...l, { t: "cmd", v: c }, ...out.map((v) => ({ t: "out", v }))]);
    if (c.trim()) setHistory((h) => [...h, c]);
    setCmd(""); setHIdx(-1);
  };

  const onKey = (e) => {
    if (e.key === "Enter") submit();
    else if (e.key === "ArrowUp") { e.preventDefault(); const i = hIdx < 0 ? history.length - 1 : Math.max(0, hIdx - 1); setHIdx(i); setCmd(history[i] || ""); }
    else if (e.key === "ArrowDown") { e.preventDefault(); const i = Math.min(history.length - 1, hIdx + 1); setHIdx(i); setCmd(history[i] || ""); }
  };

  return (
    <div className="flex h-full flex-col bg-[#0a0b0d] font-mono text-[12px] leading-relaxed" onClick={() => document.getElementById("term-input")?.focus()} data-testid="terminal-tab">
      <div className="flex-1 overflow-auto p-3 text-ac-text-secondary">
        {lines.map((l, i) => (
          <div key={i} className={l.t === "cmd" ? "text-ac-text" : "text-ac-text-secondary"}>
            {l.t === "cmd" ? <><span className="text-ac-accent">➜ </span>{l.v}</> : l.v}
          </div>
        ))}
        <div className="flex items-center">
          <span className="text-ac-accent">➜&nbsp;</span>
          <input id="term-input" value={cmd} onChange={(e) => setCmd(e.target.value)} onKeyDown={onKey} autoFocus spellCheck={false} className="flex-1 bg-transparent text-ac-text outline-none" data-testid="terminal-input" />
        </div>
        <div ref={endRef} />
      </div>
    </div>
  );
}
