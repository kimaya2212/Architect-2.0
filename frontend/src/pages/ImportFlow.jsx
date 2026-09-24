import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Github, UploadCloud, Link2, Boxes, Check, Loader2, ArrowRight, ArrowLeft,
  Search, Lock, Globe, AlertTriangle, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ds/Button";
import { Badge } from "@/components/ds/Badge";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const REPOS = [
  { name: "acme/dashboard", priv: true, lang: "TypeScript" },
  { name: "acme/marketing-site", priv: false, lang: "JavaScript" },
  { name: "acme/support-agent", priv: true, lang: "Python" },
  { name: "ada/side-project", priv: false, lang: "TypeScript" },
];
const CHECKS = ["Detecting stack", "Reading dependencies", "Finding env vars", "Checking database", "Finding agents"];

export default function ImportFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [tab, setTab] = useState("github");
  const [repo, setRepo] = useState(null);
  const [url, setUrl] = useState("");
  const [q, setQ] = useState("");
  const [checkIdx, setCheckIdx] = useState(-1);
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("main");
  const [mode, setMode] = useState("pro");
  const [busy, setBusy] = useState(false);

  const source = repo?.name || (url.trim() ? url.trim() : null);

  const goAnalyze = () => {
    setName((source || "imported-app").split("/").pop());
    setStep(1);
  };

  useEffect(() => {
    if (step !== 1) return;
    setCheckIdx(0);
    const timers = CHECKS.map((_, i) => setTimeout(() => setCheckIdx(i + 1), 700 * (i + 1)));
    return () => timers.forEach(clearTimeout);
  }, [step]);

  const analysisDone = checkIdx >= CHECKS.length;

  const finish = async () => {
    setBusy(true);
    try {
      const r = await api.post("/projects", {
        name: name || "Imported app",
        description: `Imported from ${source}`,
        type: "fullstack",
        framework: "Next.js",
        mode,
        prompt: `Imported project from ${source}. A Next.js 14 app with Tailwind, Postgres and 2 LangGraph agents.`,
      });
      toast("Imported", { description: "Opening in the workspace." });
      navigate(`/project/${r.data.id}`);
    } finally { setBusy(false); }
  };

  const filtered = REPOS.filter((r) => !q || r.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <button onClick={() => navigate("/home")} className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-ac-text-muted hover:text-ac-text"><ArrowLeft className="h-4 w-4" /> Home</button>
      <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-ac-text">Import a project</h1>

      {/* stepper */}
      <div className="mt-6 flex items-center gap-2">
        {["Source", "Analysis", "Confirm"].map((s, i) => (
          <React.Fragment key={s}>
            <div className={cn("flex items-center gap-2 text-[13px]", i <= step ? "text-ac-text" : "text-ac-text-muted")}>
              <span className={cn("flex h-6 w-6 items-center justify-center rounded-full border text-[12px]", i < step ? "border-ac-accent bg-ac-accent text-ac-accent-text" : i === step ? "border-ac-accent text-ac-accent" : "border-ac-line")}>{i < step ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}</span>
              {s}
            </div>
            {i < 2 && <div className="h-px flex-1 bg-ac-line" />}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-6 rounded-[14px] border border-ac-line bg-ac-surface p-5">
        {step === 0 && (
          <>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {[{ id: "github", l: "GitHub", i: Github }, { id: "zip", l: "Upload zip", i: UploadCloud }, { id: "url", l: "Paste URL", i: Link2 }, { id: "other", l: "Other platform", i: Boxes }].map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)} className={cn("flex items-center gap-1.5 rounded-[6px] px-2.5 py-1.5 text-[12px] font-medium", tab === t.id ? "bg-ac-elevated text-ac-text" : "text-ac-text-muted hover:text-ac-text-secondary")} data-testid={`import-tab-${t.id}`}><t.i className="h-3.5 w-3.5" /> {t.l}</button>
              ))}
            </div>
            {tab === "github" && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="relative flex-1"><Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ac-text-muted" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search repositories" className="focus-ring h-9 w-full rounded-[6px] border border-ac-line bg-ac-base pl-8 pr-2 text-[13px] text-ac-text" data-testid="repo-search" /></div>
                  <Badge tone="outline">acme ▾</Badge>
                </div>
                <div className="space-y-1.5">
                  {filtered.map((r) => (
                    <button key={r.name} onClick={() => setRepo(r)} className={cn("flex w-full items-center gap-3 rounded-[8px] border p-3 text-left", repo?.name === r.name ? "border-ac-accent bg-[color-mix(in_srgb,var(--ac-accent)_8%,transparent)]" : "border-ac-line hover:border-ac-line-strong")} data-testid={`repo-${r.name.split("/")[1]}`}>
                      <Github className="h-4 w-4 text-ac-text-secondary" />
                      <span className="flex-1 font-mono text-[13px] text-ac-text">{r.name}</span>
                      <Badge tone="outline">{r.lang}</Badge>
                      {r.priv ? <Lock className="h-3.5 w-3.5 text-ac-text-muted" /> : <Globe className="h-3.5 w-3.5 text-ac-text-muted" />}
                      {repo?.name === r.name && <Check className="h-4 w-4 text-ac-accent" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {tab === "zip" && (
              <button onClick={() => { setRepo({ name: "upload/app.zip" }); toast("File selected", { description: "app.zip ready to import." }); }} className="flex w-full flex-col items-center gap-2 rounded-[10px] border-2 border-dashed border-ac-line py-12 text-ac-text-muted hover:border-ac-accent hover:text-ac-text-secondary" data-testid="zip-drop">
                <UploadCloud className="h-8 w-8" strokeWidth={1.25} />
                <span className="text-[13px]">Drop a .zip here, or click to browse</span>
              </button>
            )}
            {tab === "url" && (
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://github.com/user/repo" className="focus-ring h-10 w-full rounded-md border border-ac-line bg-ac-base px-3 font-mono text-[13px] text-ac-text" data-testid="url-input" />
            )}
            {tab === "other" && (
              <div className="space-y-2 text-[13px] text-ac-text-secondary">
                {["Lovable", "Replit", "Bolt"].map((p) => (
                  <div key={p} className="rounded-[8px] border border-ac-line bg-ac-base p-3"><span className="font-medium text-ac-text">{p}</span> — export your project as a .zip, then use the Upload zip tab.</div>
                ))}
              </div>
            )}
            <div className="mt-5 flex justify-end"><Button variant="primary" size="md" disabled={!source} onClick={goAnalyze} data-testid="import-analyze">Analyze <ArrowRight className="h-4 w-4" /></Button></div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="space-y-2">
              {CHECKS.map((c, i) => (
                <div key={c} className="flex items-center gap-2.5 text-[13px]" data-testid={`analysis-${i}`}>
                  {i < checkIdx ? <Check className="h-4 w-4 text-ac-success" strokeWidth={2.5} /> : i === checkIdx ? <Loader2 className="h-4 w-4 animate-spin text-ac-accent" /> : <span className="h-4 w-4 rounded-full border border-ac-line-strong" />}
                  <span className={i <= checkIdx ? "text-ac-text" : "text-ac-text-muted"}>{c}</span>
                </div>
              ))}
            </div>
            {analysisDone && (
              <div className="mt-5 animate-fade-up space-y-3">
                <div className="rounded-[10px] border border-ac-line bg-ac-base p-4">
                  <div className="mb-1 flex items-center gap-2 text-[13px] font-medium text-ac-text"><Sparkles className="h-4 w-4 text-ac-accent" /> Stack report</div>
                  <p className="font-mono text-[12px] text-ac-text-secondary">Next.js 14 · Tailwind · Postgres · 2 agents (LangGraph)</p>
                </div>
                <div className="rounded-[10px] border border-ac-line bg-ac-base p-4">
                  <div className="mb-2 flex items-center gap-2 text-[13px] font-medium text-ac-warning"><AlertTriangle className="h-4 w-4" /> 2 issues</div>
                  {["2 missing environment variables", "Build script not found"].map((iss) => (
                    <div key={iss} className="flex items-center gap-2 border-t border-ac-line py-2 text-[13px] first:border-0"><span className="flex-1 text-ac-text-secondary">{iss}</span><Button variant="ghost" size="sm" onClick={() => toast("Ask Architect to fix", { description: iss })}>Fix</Button></div>
                  ))}
                </div>
                <div className="flex justify-between"><Button variant="ghost" size="md" onClick={() => setStep(0)}><ArrowLeft className="h-4 w-4" /> Back</Button><Button variant="primary" size="md" onClick={() => setStep(2)} data-testid="import-continue">Continue <ArrowRight className="h-4 w-4" /></Button></div>
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div><label className="text-[13px] font-medium text-ac-text-secondary">Project name</label><input value={name} onChange={(e) => setName(e.target.value)} className="focus-ring mt-1.5 h-10 w-full rounded-md border border-ac-line bg-ac-base px-3 text-[14px] text-ac-text" data-testid="import-name" /></div>
            <div><label className="text-[13px] font-medium text-ac-text-secondary">Branch</label>
              <div className="mt-1.5 flex gap-1.5">{["main", "develop"].map((b) => <button key={b} onClick={() => setBranch(b)} className={cn("rounded-[6px] border px-3 py-1.5 font-mono text-[12px]", branch === b ? "border-ac-accent text-ac-text" : "border-ac-line text-ac-text-muted")}>{b}</button>)}</div>
            </div>
            <div><label className="text-[13px] font-medium text-ac-text-secondary">Workspace mode</label>
              <div className="mt-1.5 flex gap-1.5">{[["simple", "Simple"], ["pro", "Pro"]].map(([v, l]) => <button key={v} onClick={() => setMode(v)} className={cn("rounded-[6px] border px-3 py-1.5 text-[13px]", mode === v ? "border-ac-accent text-ac-text" : "border-ac-line text-ac-text-muted")}>{l}</button>)}</div>
            </div>
            <div className="flex justify-between pt-1"><Button variant="ghost" size="md" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4" /> Back</Button><Button variant="primary" size="md" loading={busy} onClick={finish} data-testid="import-open">Open in Architect <ArrowRight className="h-4 w-4" /></Button></div>
          </div>
        )}
      </div>
    </div>
  );
}
