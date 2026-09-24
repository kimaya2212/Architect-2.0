import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Paperclip, ChevronDown, ArrowUp, Sparkles, GitBranch, LayoutTemplate, Bot,
  Search, LayoutGrid, List, Wand2, FolderPlus, FileUp, Link2, Figma,
} from "lucide-react";
import { Button } from "@/components/ds/Button";
import { Badge } from "@/components/ds/Badge";
import { Segmented } from "@/components/ds/Segmented";
import { EmptyState } from "@/components/ds/EmptyState";
import { ProjectCard } from "@/components/ProjectCard";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import {
  PROJECT_TYPES, FRAMEWORKS, MODELS, PLACEHOLDERS, SUGGESTIONS, EXAMPLE_PROMPTS, ENTRY_CARDS,
} from "@/lib/mockData";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ICONS = { GitBranch, LayoutTemplate, Bot };

function Pill({ label, value, options, onChange, testId }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-ac-line bg-ac-surface px-2.5 text-[12px] font-medium text-ac-text-secondary transition-colors hover:border-ac-line-strong hover:text-ac-text" data-testid={testId}>
          {label && <span className="text-ac-text-muted">{label}</span>}
          {value}
          <ChevronDown className="h-3 w-3 text-ac-text-muted" strokeWidth={1.5} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="border-ac-line bg-ac-elevated">
        {options.map((o) => (
          <DropdownMenuItem key={o} className="text-ac-text-secondary" onClick={() => onChange(o)}>{o}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState("web");
  const [framework, setFramework] = useState("Auto");
  const [model, setModel] = useState(MODELS[0]);
  const [planFirst, setPlanFirst] = useState(user?.mode === "simple");
  const [phIdx, setPhIdx] = useState(0);
  const [projects, setProjects] = useState(null);
  const [creating, setCreating] = useState(false);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("grid");
  const taRef = useRef(null);

  const typeLabel = PROJECT_TYPES.find((t) => t.value === type)?.label;

  const load = () => api.get("/projects").then((r) => setProjects(r.data)).catch(() => setProjects([]));
  useEffect(() => { load(); }, []);
  useEffect(() => { const t = setInterval(() => setPhIdx((i) => (i + 1) % PLACEHOLDERS.length), 3800); return () => clearInterval(t); }, []);
  useEffect(() => { setFramework("Auto"); }, [type]);

  const greeting = () => {
    const h = new Date().getHours();
    const part = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
    return `${part}, ${user?.name?.split(" ")[0] || "there"}`;
  };

  const send = async () => {
    if (!prompt.trim()) { taRef.current?.focus(); return; }
    setCreating(true);
    try {
      const res = await api.post("/projects", { prompt: prompt.trim(), type, framework, mode: user?.mode || "simple" });
      setPrompt("");
      await load();
      toast(planFirst ? "Plan drafted" : "Project created", {
        description: planFirst ? `Review the plan for "${res.data.name}" in the workspace (opens next phase).` : `"${res.data.name}" is ready to build.`,
      });
    } catch (e) {
      toast("Couldn't create project", { description: "Please try again." });
    } finally { setCreating(false); }
  };

  const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  const loadSample = async () => {
    await api.post("/projects/load-sample");
    await load();
    toast("Sample data loaded", { description: "4 example projects added to your workspace." });
  };

  const entryAction = (key) => {
    if (key === "template") { window.location.href = "/templates"; return; }
    const map = {
      import: { t: "Import a project", d: "The 3-step import flow (GitHub, .zip, URL) opens in the next phase." },
      agent: { t: "Build an agent", d: "The agent wizard (LangGraph, CrewAI and more) opens in the next phase." },
    };
    toast(map[key].t, { description: map[key].d });
  };

  const filtered = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => (filter === "all" || p.status === filter) && (!q || p.name.toLowerCase().includes(q.toLowerCase())));
  }, [projects, filter, q]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="animate-fade-up text-[28px] font-semibold tracking-[-0.02em] text-ac-text">{greeting()}</h1>
      <p className="mt-1 animate-fade-up text-[14px] text-ac-text-muted" style={{ animationDelay: "40ms" }}>What do you want to build today?</p>

      {/* Hero prompt box */}
      <div className="mt-6 animate-fade-up rounded-[14px] border border-ac-line-strong bg-ac-surface p-3 transition-shadow focus-within:shadow-float focus-within:ring-1 focus-within:ring-ac-accent/40" style={{ animationDelay: "80ms" }} data-testid="hero-prompt-box">
        <textarea
          ref={taRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={onKey}
          rows={3}
          placeholder={PLACEHOLDERS[phIdx]}
          className="w-full resize-none bg-transparent px-2 pt-1 text-[15px] leading-relaxed text-ac-text outline-none placeholder:text-ac-text-muted"
          data-testid="prompt-input"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex h-8 items-center gap-1.5 rounded-[6px] border border-ac-line bg-ac-surface px-2.5 text-[12px] font-medium text-ac-text-secondary hover:border-ac-line-strong hover:text-ac-text" data-testid="attach-btn">
                <Paperclip className="h-3.5 w-3.5" strokeWidth={1.5} /> Attach
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="border-ac-line bg-ac-elevated">
              {[{ i: FileUp, l: "Upload files" }, { i: Figma, l: "Figma link" }, { i: Link2, l: "URL to clone" }].map((o) => (
                <DropdownMenuItem key={o.l} className="text-ac-text-secondary" onClick={() => toast("Attach", { description: `${o.l} — attachments are wired up in the next phase.` })}><o.i className="mr-2 h-4 w-4" /> {o.l}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Pill label="Type:" value={typeLabel} options={PROJECT_TYPES.map((t) => t.label)} onChange={(l) => setType(PROJECT_TYPES.find((t) => t.label === l).value)} testId="type-selector" />
          <Pill label="" value={framework} options={FRAMEWORKS[type]} onChange={setFramework} testId="framework-selector" />
          <Pill label="" value={model} options={MODELS} onChange={setModel} testId="model-selector" />

          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setPlanFirst((p) => !p)} className={`inline-flex h-8 items-center gap-1.5 rounded-[6px] border px-2.5 text-[12px] font-medium transition-colors ${planFirst ? "border-ac-accent text-ac-accent" : "border-ac-line text-ac-text-muted hover:text-ac-text-secondary"}`} data-testid="plan-first-toggle">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} /> Plan first
            </button>
            <Button variant="primary" size="icon" onClick={send} loading={creating} aria-label="Send" data-testid="prompt-send">
              {!creating && <ArrowUp className="h-4 w-4" strokeWidth={2} />}
            </Button>
          </div>
        </div>
      </div>

      {/* suggestion chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => { setPrompt(s); taRef.current?.focus(); }} className="rounded-full border border-ac-line bg-ac-surface px-3 py-1.5 text-[12px] text-ac-text-secondary transition-colors hover:border-ac-line-strong hover:text-ac-text" data-testid={`suggestion-${s.slice(0, 8)}`}>
            {s}
          </button>
        ))}
      </div>

      {/* entry cards */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {ENTRY_CARDS.map((c) => {
          const I = ICONS[c.icon];
          return (
            <button key={c.key} onClick={() => entryAction(c.key)} className="group flex items-start gap-3 rounded-[12px] border border-ac-line bg-ac-surface p-4 text-left transition-all duration-150 hover:border-ac-line-strong hover:-translate-y-0.5" data-testid={`entry-${c.key}`}>
              <div className="flex h-9 w-9 items-center justify-center rounded-[9px] border border-ac-line bg-ac-elevated">
                <I className="h-4 w-4 text-ac-accent" strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-[14px] font-medium text-ac-text">{c.title}</div>
                <div className="mt-0.5 text-[12px] text-ac-text-muted">{c.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* recent projects */}
      <div className="mt-12">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h2 className="text-[16px] font-semibold text-ac-text">Continue where you left off</h2>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ac-text-muted" strokeWidth={1.5} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="focus-ring h-8 w-40 rounded-[6px] border border-ac-line bg-ac-surface pl-8 pr-2 text-[13px] text-ac-text placeholder:text-ac-text-muted" data-testid="projects-search" />
            </div>
            <Pill label="" value={filter === "all" ? "All status" : filter[0].toUpperCase() + filter.slice(1)} options={["all", "live", "building", "draft", "failed"].map((s) => (s === "all" ? "all" : s))} onChange={setFilter} testId="status-filter" />
            <Segmented testId="view-toggle" size="sm" value={view} onChange={setView} options={[{ value: "grid", icon: <LayoutGrid className="h-3.5 w-3.5" /> }, { value: "list", icon: <List className="h-3.5 w-3.5" /> }]} />
          </div>
        </div>

        {projects === null ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <div key={i} className="skeleton h-56 rounded-[12px]" />)}
          </div>
        ) : filtered.length === 0 && projects.length === 0 ? (
          <div className="rounded-[14px] border border-dashed border-ac-line bg-ac-surface">
            <EmptyState
              icon={Wand2}
              title="Your first project starts with one sentence"
              description="Describe what you want above, or load sample projects to explore the workspace."
              action={
                <div className="flex items-center gap-2">
                  <Button variant="primary" size="md" onClick={() => taRef.current?.focus()} data-testid="empty-start">Write a prompt</Button>
                  <Button variant="secondary" size="md" onClick={loadSample} data-testid="load-sample"><FolderPlus className="h-4 w-4" strokeWidth={1.5} /> Load sample data</Button>
                </div>
              }
            />
            <div className="grid gap-2 border-t border-ac-line p-4 sm:grid-cols-3">
              {EXAMPLE_PROMPTS.map((ex, i) => (
                <button key={i} onClick={() => { setPrompt(ex); taRef.current?.focus(); }} className="rounded-[10px] border border-ac-line bg-ac-base p-3 text-left text-[12px] leading-relaxed text-ac-text-muted hover:border-ac-line-strong hover:text-ac-text-secondary" data-testid={`example-prompt-${i}`}>
                  {ex}
                </button>
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Search} title="No projects match" description="Try a different search or status filter." />
        ) : view === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => <ProjectCard key={p.id} project={p} onChanged={load} />)}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => <ProjectCard key={p.id} project={p} onChanged={load} view="list" />)}
          </div>
        )}
      </div>
    </div>
  );
}
