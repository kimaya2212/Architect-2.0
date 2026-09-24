import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Bot, Plus, ArrowRight, ArrowLeft, Check, Sparkles, Play } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ds/Button";
import { Badge } from "@/components/ds/Badge";
import { EmptyState } from "@/components/ds/EmptyState";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

const FRAMEWORKS = [
  { id: "LangGraph", desc: "Graph-based, great for complex multi-step flows." },
  { id: "CrewAI", desc: "Role-based crews of collaborating agents." },
  { id: "OpenAI Agents SDK", desc: "Native tools and handoffs on OpenAI." },
  { id: "Claude Agent SDK", desc: "Anthropic-native agent loop with tools." },
  { id: "AutoGen", desc: "Conversational multi-agent orchestration." },
  { id: "Custom", desc: "Bring your own Python or TypeScript." },
  { id: "auto", desc: "Let Architect choose based on your goal." },
];
const MODELS = ["Claude Sonnet 4.6", "GPT-5.4", "Gemini 3.1 Pro", "Claude Haiku 4.5"];
const TOOLS = ["Web search", "Database", "Email", "Stripe", "Custom API", "MCP server"];

function Sparkline({ seed = 7 }) {
  const pts = Array.from({ length: 12 }, (_, i) => 50 + Math.sin(i * 0.9 + seed) * 22 + (i % 3) * 4);
  const d = pts.map((y, i) => `${(i / 11) * 100},${40 - (y / 100) * 30}`).join(" ");
  return (
    <svg viewBox="0 0 100 40" className="h-8 w-24" preserveAspectRatio="none">
      <polyline points={d} fill="none" stroke="var(--ac-accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Wizard({ open, onClose, onCreated }) {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("");
  const [framework, setFramework] = useState("auto");
  const [model, setModel] = useState(MODELS[0]);
  const [tools, setTools] = useState(["Web search"]);
  const [busy, setBusy] = useState(false);

  const reset = () => { setStep(0); setGoal(""); setFramework("auto"); setModel(MODELS[0]); setTools(["Web search"]); };
  const close = () => { onClose(); setTimeout(reset, 200); };
  const recommended = /research|search|web|scrape/.test(goal.toLowerCase()) ? "CrewAI" : "LangGraph";
  const resolvedFw = framework === "auto" ? recommended : framework;

  const create = async () => {
    setBusy(true);
    try {
      const name = goal.split(" ").slice(0, 4).join(" ").replace(/[^\w\s]/g, "") || "New agent";
      const r = await api.post("/agents", { name: name.charAt(0).toUpperCase() + name.slice(1), goal, framework: resolvedFw, model, tools });
      toast("Agent created", { description: `${r.data.name} is ready to test.` });
      onCreated(r.data);
      close();
    } finally { setBusy(false); }
  };

  const canNext = step === 0 ? goal.trim().length > 3 : true;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-lg border-ac-line bg-ac-elevated" data-testid="agent-wizard">
        <DialogHeader>
          <DialogTitle className="text-ac-text">New agent</DialogTitle>
          <DialogDescription className="text-ac-text-muted">Describe the goal, pick a framework, and Architect drafts the blueprint.</DialogDescription>
        </DialogHeader>

        <div className="mb-2 flex gap-1.5">{[0, 1, 2, 3].map((i) => <span key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-ac-accent" : "bg-ac-line"}`} />)}</div>

        {step === 0 && (
          <div>
            <label className="text-[13px] font-medium text-ac-text-secondary">What should this agent do?</label>
            <textarea autoFocus value={goal} onChange={(e) => setGoal(e.target.value)} rows={3} placeholder="Answer customer questions from our docs and draft replies…" className="focus-ring mt-2 w-full resize-none rounded-[8px] border border-ac-line bg-ac-surface p-3 text-[14px] text-ac-text placeholder:text-ac-text-muted" data-testid="wizard-goal" />
          </div>
        )}
        {step === 1 && (
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {FRAMEWORKS.map((f) => (
              <button key={f.id} onClick={() => setFramework(f.id)} className={`flex w-full items-center gap-3 rounded-[8px] border p-3 text-left ${framework === f.id ? "border-ac-accent bg-[color-mix(in_srgb,var(--ac-accent)_8%,transparent)]" : "border-ac-line hover:border-ac-line-strong"}`} data-testid={`wizard-fw-${f.id}`}>
                <div className="flex-1"><div className="text-[13px] font-medium text-ac-text">{f.id === "auto" ? "Let Architect choose" : f.id}</div><div className="text-[12px] text-ac-text-muted">{f.desc}{f.id === "auto" && ` Recommends ${recommended}.`}</div></div>
                {framework === f.id && <Check className="h-4 w-4 text-ac-accent" />}
              </button>
            ))}
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-[13px] font-medium text-ac-text-secondary">Model</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {MODELS.map((m) => <button key={m} onClick={() => setModel(m)} className={`rounded-[8px] border px-3 py-2 text-[13px] ${model === m ? "border-ac-accent text-ac-text" : "border-ac-line text-ac-text-secondary hover:border-ac-line-strong"}`} data-testid={`wizard-model-${m}`}>{m}</button>)}
              </div>
            </div>
            <div>
              <label className="text-[13px] font-medium text-ac-text-secondary">Tools</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {TOOLS.map((t) => { const on = tools.includes(t); return (
                  <button key={t} onClick={() => setTools((ts) => on ? ts.filter((x) => x !== t) : [...ts, t])} className={`rounded-full border px-3 py-1.5 text-[12px] ${on ? "border-ac-accent text-ac-accent" : "border-ac-line text-ac-text-secondary hover:text-ac-text"}`} data-testid={`wizard-tool-${t}`}>{t}</button>
                ); })}
              </div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="rounded-[10px] border border-ac-line bg-ac-surface p-4">
            <div className="mb-2 flex items-center gap-2 text-[13px] font-medium text-ac-text"><Sparkles className="h-4 w-4 text-ac-accent" /> Blueprint</div>
            <dl className="space-y-2 text-[13px]">
              <div className="flex justify-between"><dt className="text-ac-text-muted">Goal</dt><dd className="max-w-[60%] text-right text-ac-text">{goal}</dd></div>
              <div className="flex justify-between"><dt className="text-ac-text-muted">Framework</dt><dd className="text-ac-text">{resolvedFw}</dd></div>
              <div className="flex justify-between"><dt className="text-ac-text-muted">Model</dt><dd className="text-ac-text">{model}</dd></div>
              <div className="flex justify-between"><dt className="text-ac-text-muted">Tools</dt><dd className="text-ac-text">{tools.join(", ") || "None"}</dd></div>
            </dl>
          </div>
        )}

        <div className="mt-2 flex items-center justify-between">
          <Button variant="ghost" size="md" onClick={() => (step === 0 ? close() : setStep(step - 1))}><ArrowLeft className="h-4 w-4" /> {step === 0 ? "Cancel" : "Back"}</Button>
          {step < 3 ? (
            <Button variant="primary" size="md" disabled={!canNext} onClick={() => setStep(step + 1)} data-testid="wizard-next">Continue <ArrowRight className="h-4 w-4" /></Button>
          ) : (
            <Button variant="primary" size="md" loading={busy} onClick={create} data-testid="wizard-create">Create agent</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Agents() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState(null);
  const [wizard, setWizard] = useState(false);

  const load = () => api.get("/agents").then((r) => setAgents(r.data)).catch(() => setAgents([]));
  useEffect(() => { load(); }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-ac-text">Agents</h1>
          <p className="mt-1 text-[14px] text-ac-text-muted">Design, test and deploy AI agents with live traces.</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setWizard(true)} data-testid="new-agent-btn"><Plus className="h-4 w-4" strokeWidth={2} /> New agent</Button>
      </div>

      {agents === null ? (
        <div className="grid gap-4 sm:grid-cols-2">{[0, 1].map((i) => <div key={i} className="skeleton h-40 rounded-[12px]" />)}</div>
      ) : agents.length === 0 ? (
        <EmptyState icon={Bot} title="No agents yet" description="Create your first agent and try it in the playground." action={<Button variant="primary" size="md" onClick={() => setWizard(true)}><Plus className="h-4 w-4" /> New agent</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {agents.map((a, i) => (
            <div key={a.id} className="group rounded-[12px] border border-ac-line bg-ac-surface p-5 transition-colors hover:border-ac-line-strong" data-testid={`agent-card-${a.id}`}>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-ac-line bg-ac-elevated"><Bot className="h-5 w-5 text-ac-accent" strokeWidth={1.5} /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><h3 className="truncate text-[15px] font-semibold text-ac-text">{a.name}</h3><Badge tone={a.status === "active" ? "accent" : "outline"}>{a.status}</Badge></div>
                  <p className="mt-0.5 line-clamp-2 text-[12px] text-ac-text-muted">{a.goal}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[12px] text-ac-text-muted"><Badge tone="outline">{a.framework}</Badge><span>{a.success_rate}% success</span></div>
                <Sparkline seed={i + 3} />
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="primary" size="sm" className="flex-1" onClick={() => navigate(`/agents/${a.id}`)} data-testid={`open-agent-${a.id}`}><Play className="h-4 w-4" strokeWidth={1.5} /> Open playground</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Wizard open={wizard} onClose={() => setWizard(false)} onCreated={(a) => { setAgents((prev) => [a, ...(prev || [])]); navigate(`/agents/${a.id}`); }} />
    </div>
  );
}
