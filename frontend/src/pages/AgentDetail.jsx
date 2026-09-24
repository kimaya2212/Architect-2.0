import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft, Bot, Send, BrainCircuit, Search, Wrench, Users, ChevronRight, RotateCw,
  Save, Code2, Cpu, MessageSquareText, Boxes, ShieldCheck, Database, Play, Check, X,
} from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ds/Button";
import { Badge } from "@/components/ds/Badge";
import { PageSkeleton } from "@/components/PageSkeleton";
import { buildTrace } from "@/lib/aiEngine";
import { cn } from "@/lib/utils";

const TABS = ["Blueprint", "Playground", "Tools", "Evals", "Versions", "Deploy & API", "Monitoring"];
const STEP_META = {
  llm: { icon: BrainCircuit, color: "var(--ac-accent)", label: "LLM call" },
  retrieval: { icon: Search, color: "var(--ac-info)", label: "Retrieval" },
  tool: { icon: Wrench, color: "var(--ac-warning)", label: "Tool call" },
  handoff: { icon: Users, color: "var(--ac-success)", label: "Handoff" },
};

function TraceStep({ step, active, done }) {
  const [open, setOpen] = useState(false);
  const M = STEP_META[step.type];
  return (
    <div className={cn("rounded-[8px] border bg-ac-base transition-colors", active ? "border-ac-accent" : "border-ac-line")} data-testid={`trace-step-${step.type}`}>
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left">
        <span className="flex h-6 w-6 items-center justify-center rounded-[6px]" style={{ background: `color-mix(in srgb, ${M.color} 16%, transparent)` }}>
          {active ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: M.color, borderTopColor: "transparent" }} /> : <M.icon className="h-3.5 w-3.5" style={{ color: M.color }} strokeWidth={1.5} />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[13px] text-ac-text">{step.title}{step.model && <span className="text-[11px] text-ac-text-muted">{step.model}</span>}{step.tool && <Badge tone="warning">{step.tool}</Badge>}</div>
        </div>
        {done && <div className="flex items-center gap-2 font-mono text-[11px] text-ac-text-muted">{step.tokens > 0 && <span>{step.tokens} tok</span>}<span>{step.latency}ms</span></div>}
        <ChevronRight className={cn("h-3.5 w-3.5 text-ac-text-muted transition-transform", open && "rotate-90")} />
      </button>
      {open && (
        <div className="space-y-2 border-t border-ac-line px-3 py-2 font-mono text-[11px]">
          <div><span className="text-ac-text-muted">input </span><span className="text-ac-text-secondary">{step.input}</span></div>
          <div><span className="text-ac-text-muted">output </span><span className="text-ac-text-secondary">{step.output}</span></div>
          {done && <div className="text-ac-text-muted">cost ${step.cost.toFixed(4)}</div>}
        </div>
      )}
    </div>
  );
}

function Playground({ agent }) {
  const [messages, setMessages] = useState([{ role: "assistant", content: `Hi, I'm ${agent.name}. Ask me anything.` }]);
  const [input, setInput] = useState("");
  const [trace, setTrace] = useState([]);
  const [activeStep, setActiveStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const [totals, setTotals] = useState(null);
  const [streamId, setStreamId] = useState(null);
  const timers = useRef([]);
  const scrollRef = useRef(null);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => { scrollRef.current?.scrollTo({ top: 1e9, behavior: "smooth" }); }, [messages]);

  const run = (q) => {
    if (!q.trim() || running) return;
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setRunning(true); setTotals(null); setActiveStep(-1);
    const { steps, answer, totals: tot } = buildTrace(q);
    setTrace(steps);

    let i = 0;
    const reveal = () => {
      setActiveStep(i);
      const t = setTimeout(() => {
        i += 1;
        if (i < steps.length) reveal();
        else { setActiveStep(-1); streamAnswer(answer, tot); }
      }, Math.min(900, steps[i].latency + 300));
      timers.current.push(t);
    };
    reveal();
  };

  const streamAnswer = (answer, tot) => {
    const id = "a" + Date.now();
    setMessages((m) => [...m, { role: "assistant", content: "", id }]);
    setStreamId(id);
    let n = 0;
    const tick = () => {
      n += Math.max(1, Math.round(answer.length / 50));
      setMessages((m) => m.map((x) => (x.id === id ? { ...x, content: answer.slice(0, n) } : x)));
      if (n < answer.length) { const t = setTimeout(tick, 22); timers.current.push(t); }
      else { setStreamId(null); setRunning(false); setTotals(tot); }
    };
    const t = setTimeout(tick, 150); timers.current.push(t);
  };

  const doneCount = totals ? trace.length : activeStep < 0 ? 0 : activeStep;

  return (
    <div className="grid h-full grid-cols-2 gap-0 overflow-hidden">
      {/* chat */}
      <div className="flex flex-col border-r border-ac-line">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex gap-2.5"}>
              {m.role === "assistant" && <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border border-ac-line bg-ac-surface"><Bot className="h-3.5 w-3.5 text-ac-accent" /></div>}
              <div className={m.role === "user" ? "max-w-[85%] rounded-[12px] rounded-tr-[4px] bg-ac-elevated px-3 py-2 text-[13px] text-ac-text" : "min-w-0 flex-1 whitespace-pre-wrap text-[13px] leading-relaxed text-ac-text-secondary"}>
                {m.content}{streamId === m.id && <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-caret-blink bg-ac-accent" />}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 border-t border-ac-line p-3">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run(input)} placeholder="Message the agent…" className="focus-ring h-10 flex-1 rounded-[8px] border border-ac-line bg-ac-surface px-3 text-[13px] text-ac-text" data-testid="playground-input" />
          <button onClick={() => run(input)} disabled={running || !input.trim()} className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-ac-accent text-ac-accent-text disabled:opacity-40" data-testid="playground-send"><Send className="h-4 w-4" /></button>
        </div>
      </div>

      {/* trace */}
      <div className="flex flex-col bg-ac-base">
        <div className="flex items-center justify-between border-b border-ac-line px-4 py-2.5">
          <span className="text-[13px] font-medium text-ac-text">Trace</span>
          {totals && (
            <div className="flex gap-2">
              <button onClick={() => run(messages.filter((m) => m.role === "user").slice(-1)[0]?.content || "How do I reset my password?")} className="flex items-center gap-1 rounded-[6px] border border-ac-line px-2 py-1 text-[11px] text-ac-text-secondary hover:text-ac-text" data-testid="trace-replay"><RotateCw className="h-3 w-3" /> Replay</button>
              <button onClick={() => toast("Saved as test case", { description: "Added to Evals with the expected behavior." })} className="flex items-center gap-1 rounded-[6px] border border-ac-line px-2 py-1 text-[11px] text-ac-text-secondary hover:text-ac-text" data-testid="trace-save"><Save className="h-3 w-3" /> Save as test</button>
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {trace.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-[13px] text-ac-text-muted">Send a message to see the agent's reasoning, tool calls and cost.</div>
          ) : trace.map((s, i) => <TraceStep key={i} step={s} active={activeStep === i} done={totals != null || i < doneCount} />)}
        </div>
        {totals && (
          <div className="grid grid-cols-3 gap-2 border-t border-ac-line px-4 py-3 font-mono text-[12px]" data-testid="trace-totals">
            <div><div className="text-[10px] text-ac-text-muted">TOKENS</div><div className="text-ac-text">{totals.tokens}</div></div>
            <div><div className="text-[10px] text-ac-text-muted">LATENCY</div><div className="text-ac-text">{totals.latency}ms</div></div>
            <div><div className="text-[10px] text-ac-text-muted">COST</div><div className="text-ac-text">${totals.cost.toFixed(4)}</div></div>
          </div>
        )}
      </div>
    </div>
  );
}

function BlueprintNode({ icon: Icon, title, subtitle, onClick, active }) {
  return (
    <button onClick={onClick} className={cn("w-44 rounded-[10px] border bg-ac-surface p-3 text-left transition-colors", active ? "border-ac-accent" : "border-ac-line hover:border-ac-line-strong")}>
      <div className="mb-1.5 flex h-7 w-7 items-center justify-center rounded-[7px] border border-ac-line bg-ac-elevated"><Icon className="h-4 w-4 text-ac-accent" strokeWidth={1.5} /></div>
      <div className="text-[13px] font-medium text-ac-text">{title}</div>
      <div className="mt-0.5 line-clamp-2 text-[11px] text-ac-text-muted">{subtitle}</div>
    </button>
  );
}

function Blueprint({ agent }) {
  const [asCode, setAsCode] = useState(false);
  const [panel, setPanel] = useState(null);
  const nodes = [
    { key: "model", icon: Cpu, title: "Model", subtitle: agent.model },
    { key: "prompt", icon: MessageSquareText, title: "System prompt", subtitle: agent.system_prompt || "You are a helpful agent." },
    { key: "tools", icon: Boxes, title: "Tools", subtitle: (agent.tools || []).join(", ") || "None" },
    { key: "memory", icon: Database, title: "Memory", subtitle: "Conversation + vector recall" },
    { key: "guardrails", icon: ShieldCheck, title: "Guardrails", subtitle: "No PII · stay on topic" },
  ];

  if (asCode) {
    const code = JSON.stringify({ name: agent.name, framework: agent.framework, model: agent.model, tools: agent.tools, system_prompt: agent.system_prompt, memory: "vector", guardrails: ["no_pii", "on_topic"] }, null, 2);
    return (
      <div className="flex h-full flex-col">
        <div className="flex justify-end p-3"><Button variant="secondary" size="sm" onClick={() => setAsCode(false)}><Boxes className="h-4 w-4" /> Visual</Button></div>
        <pre className="flex-1 overflow-auto px-4 pb-4 font-mono text-[12px] leading-relaxed text-ac-text-secondary">{code}</pre>
      </div>
    );
  }

  return (
    <div className="relative flex h-full">
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-4 flex justify-end"><Button variant="secondary" size="sm" onClick={() => setAsCode(true)} data-testid="view-as-code"><Code2 className="h-4 w-4" /> View as code</Button></div>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-6">
          {nodes.map((n, i) => (
            <div key={n.key} className="flex items-center gap-8">
              <BlueprintNode icon={n.icon} title={n.title} subtitle={n.subtitle} active={panel === n.key} onClick={() => setPanel(n.key)} />
              {i < nodes.length - 1 && <div className="h-px w-8 bg-ac-line-strong" />}
            </div>
          ))}
        </div>
      </div>
      {panel && (
        <div className="w-72 shrink-0 border-l border-ac-line bg-ac-surface p-4" data-testid="blueprint-panel">
          <div className="mb-3 flex items-center justify-between"><span className="text-[13px] font-semibold text-ac-text capitalize">{panel}</span><button onClick={() => setPanel(null)} className="text-ac-text-muted hover:text-ac-text"><X className="h-4 w-4" /></button></div>
          <textarea defaultValue={nodes.find((n) => n.key === panel)?.subtitle} rows={5} className="focus-ring w-full resize-none rounded-[8px] border border-ac-line bg-ac-base p-2.5 text-[13px] text-ac-text" />
          <Button variant="primary" size="sm" className="mt-3 w-full" onClick={() => { setPanel(null); toast("Saved"); }}>Save</Button>
        </div>
      )}
    </div>
  );
}

function LightTab({ name, agent }) {
  if (name === "Tools") return (
    <div className="p-6"><div className="space-y-2">{["Web search", "Database", "Email", "Stripe", "Custom API", "MCP server"].map((t) => { const on = (agent.tools || []).includes(t); return (
      <div key={t} className="flex items-center gap-3 rounded-[8px] border border-ac-line bg-ac-surface p-3">
        <Wrench className="h-4 w-4 text-ac-text-secondary" /><span className="flex-1 text-[13px] text-ac-text">{t}</span>
        <Button variant="ghost" size="sm" onClick={() => toast("Tested", { description: `${t} responded in 84ms.` })}>Test</Button>
        <span className={cn("relative h-5 w-9 rounded-full transition-colors", on ? "bg-ac-accent" : "bg-ac-line-strong")}><span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all", on ? "left-4" : "left-0.5")} /></span>
      </div>
    ); })}</div></div>
  );
  if (name === "Evals") return (
    <div className="p-6"><div className="mb-3 flex items-center justify-between"><span className="text-[13px] text-ac-text-secondary">Pass rate <span className="font-semibold text-ac-success">92%</span></span><Button variant="primary" size="sm" onClick={() => toast("Running evals", { description: "12 test cases queued." })}><Play className="h-4 w-4" /> Run all</Button></div>
      <div className="overflow-hidden rounded-[10px] border border-ac-line">
        {[["Reset password", "Sends secure link", "pass"], ["Refund request", "Escalates to human", "pass"], ["Off-topic query", "Politely declines", "pass"], ["Angry customer", "De-escalates tone", "fail"]].map((r, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-ac-line px-4 py-2.5 last:border-0 text-[13px]">
            <span className="flex-1 text-ac-text">{r[0]}</span><span className="flex-1 text-ac-text-muted">{r[1]}</span>
            <Badge tone={r[2] === "pass" ? "success" : "danger"}>{r[2] === "pass" ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />} {r[2]}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
  if (name === "Versions") return (
    <div className="p-6"><div className="space-y-2">{[["v3", "Added web search tool", "production"], ["v2", "Tightened guardrails", ""], ["v1", "Initial blueprint", ""]].map((v, i) => (
      <div key={i} className="flex items-center gap-3 rounded-[8px] border border-ac-line bg-ac-surface p-3">
        <span className="font-mono text-[13px] text-ac-text">{v[0]}</span><span className="flex-1 text-[13px] text-ac-text-muted">{v[1]}</span>
        {v[2] && <Badge tone="accent">production</Badge>}
        <Button variant="ghost" size="sm" onClick={() => toast(`Compared with ${v[0]}`)}>Compare</Button>
        {!v[2] && <Button variant="secondary" size="sm" onClick={() => toast("Promoted to production", { description: v[0] })}>Promote</Button>}
      </div>
    ))}</div></div>
  );
  if (name === "Deploy & API") return (
    <div className="p-6 space-y-4">
      <div className="rounded-[10px] border border-ac-line bg-ac-surface p-4">
        <div className="text-[12px] text-ac-text-muted">Endpoint</div>
        <div className="mt-1 flex items-center gap-2"><code className="flex-1 rounded-[6px] bg-ac-base px-2 py-1.5 font-mono text-[12px] text-ac-text">https://api.architect.app/agents/{agent.id}/run</code><Button variant="ghost" size="sm" onClick={() => { navigator.clipboard?.writeText(`https://api.architect.app/agents/${agent.id}/run`); toast("Copied"); }}>Copy</Button></div>
      </div>
      <div className="rounded-[10px] border border-ac-line bg-ac-surface p-4">
        <div className="mb-2 text-[12px] text-ac-text-muted">cURL</div>
        <pre className="overflow-auto rounded-[6px] bg-ac-base p-3 font-mono text-[12px] leading-relaxed text-ac-text-secondary">{`curl https://api.architect.app/agents/${agent.id}/run \\
  -H "Authorization: Bearer sk_live_…" \\
  -d '{"input":"Reset my password"}'`}</pre>
      </div>
    </div>
  );
  // Monitoring
  return (
    <div className="p-6"><div className="grid grid-cols-3 gap-3">
      {[["Runs today", "312"], ["Error rate", "1.4%"], ["Cost / day", "$4.20"]].map(([l, v]) => (
        <div key={l} className="rounded-[10px] border border-ac-line bg-ac-surface p-4"><div className="text-[11px] text-ac-text-muted">{l}</div><div className="mt-1 text-[20px] font-semibold text-ac-text">{v}</div></div>
      ))}
    </div>
    <div className="mt-4 rounded-[10px] border border-ac-line bg-ac-surface p-4"><div className="mb-2 text-[13px] font-medium text-ac-text">Latest failed runs</div>
      {[["12:41", "Timeout calling Email tool"], ["11:02", "Guardrail blocked off-topic reply"]].map((r, i) => (
        <div key={i} className="flex gap-3 border-t border-ac-line py-2 text-[12px] first:border-0"><span className="font-mono text-ac-text-muted">{r[0]}</span><span className="text-ac-text-secondary">{r[1]}</span></div>
      ))}
    </div></div>
  );
}

export default function AgentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [tab, setTab] = useState("Playground");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => { api.get(`/agents/${id}`).then((r) => setAgent(r.data)).catch(() => setNotFound(true)); }, [id]);

  if (notFound) return <div className="flex h-[60vh] items-center justify-center text-ac-text-muted">Agent not found.</div>;
  if (!agent) return <PageSkeleton />;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-ac-line px-6 pt-5">
        <button onClick={() => navigate("/agents")} className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-ac-text-muted hover:text-ac-text" data-testid="agent-back"><ArrowLeft className="h-4 w-4" /> Agents</button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-ac-line bg-ac-elevated"><Bot className="h-5 w-5 text-ac-accent" strokeWidth={1.5} /></div>
          <div>
            <div className="flex items-center gap-2"><h1 className="text-[20px] font-semibold tracking-[-0.02em] text-ac-text">{agent.name}</h1><Badge tone="accent">{agent.framework}</Badge></div>
            <p className="text-[13px] text-ac-text-muted">{agent.model} · {agent.success_rate}% success</p>
          </div>
        </div>
        <div className="mt-4 flex gap-0.5 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("relative whitespace-nowrap px-3 py-2.5 text-[13px] font-medium transition-colors", tab === t ? "text-ac-text" : "text-ac-text-muted hover:text-ac-text-secondary")} data-testid={`agent-tab-${t}`}>
              {t}{tab === t && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-ac-accent" />}
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === "Playground" ? <Playground agent={agent} /> : tab === "Blueprint" ? <Blueprint agent={agent} /> : <div className="h-full overflow-auto"><LightTab name={tab} agent={agent} /></div>}
      </div>
    </div>
  );
}
