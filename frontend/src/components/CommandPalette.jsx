import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Search, Home, FolderGit2, LayoutTemplate, Bot, Plug, CreditCard, Settings as SettingsIcon,
  Plus, Github, ToggleRight, Rocket, CornerDownLeft, FileCode,
} from "lucide-react";
import api from "@/lib/api";
import { Kbd } from "@/components/ds/Kbd";
import { useAuth } from "@/context/AuthContext";

export function CommandPalette({ open, setOpen }) {
  const navigate = useNavigate();
  const { user, updatePrefs } = useAuth();
  const [q, setQ] = useState("");
  const [projects, setProjects] = useState([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQ(""); setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
      api.get("/projects").then((r) => setProjects(r.data)).catch(() => {});
    }
  }, [open]);

  const toggleMode = async () => {
    const next = user?.mode === "pro" ? "simple" : "pro";
    await updatePrefs({ mode: next });
    toast(`Switched to ${next === "pro" ? "Pro" : "Simple"} mode`);
  };

  const actions = useMemo(() => [
    { id: "new", label: "New project", hint: "Create", icon: Plus, run: () => navigate("/home") },
    { id: "import", label: "Import from GitHub", hint: "Action", icon: Github, run: () => navigate("/import") },
    { id: "mode", label: "Toggle Pro mode", hint: "Action", icon: ToggleRight, run: toggleMode },
    { id: "deploy", label: "Deploy current project", hint: "Action", icon: Rocket, run: () => toast("Deploy", { description: "Open a project to run the deploy pre-flight." }) },
    { id: "nav-home", label: "Go to Home", hint: "Jump", icon: Home, run: () => navigate("/home") },
    { id: "nav-projects", label: "Go to Projects", hint: "Jump", icon: FolderGit2, run: () => navigate("/projects") },
    { id: "nav-templates", label: "Go to Templates", hint: "Jump", icon: LayoutTemplate, run: () => navigate("/templates") },
    { id: "nav-agents", label: "Go to Agents", hint: "Jump", icon: Bot, run: () => navigate("/agents") },
    { id: "nav-integrations", label: "Go to Integrations", hint: "Jump", icon: Plug, run: () => navigate("/integrations") },
    { id: "nav-usage", label: "Go to Usage & Billing", hint: "Jump", icon: CreditCard, run: () => navigate("/usage") },
    { id: "nav-settings", label: "Go to Settings", hint: "Jump", icon: SettingsIcon, run: () => navigate("/settings") },
  ], [navigate, user]);

  const results = useMemo(() => {
    const ql = q.toLowerCase().trim();
    const projMatches = projects
      .filter((p) => !ql || p.name.toLowerCase().includes(ql))
      .slice(0, 5)
      .map((p) => ({ id: `p-${p.id}`, label: p.name, hint: "Project", icon: FileCode, run: () => navigate("/projects") }));
    const actMatches = actions.filter((a) => !ql || a.label.toLowerCase().includes(ql));
    return [...projMatches, ...actMatches];
  }, [q, projects, actions, navigate]);

  useEffect(() => { setActive(0); }, [q]);

  const runAt = (i) => {
    const item = results[i];
    if (!item) return;
    setOpen(false);
    setTimeout(() => item.run(), 10);
  };

  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); runAt(active); }
    else if (e.key === "Escape") { setOpen(false); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh]" data-testid="command-palette">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl animate-scale-in overflow-hidden rounded-[14px] border border-ac-line bg-ac-elevated shadow-float">
        <div className="flex items-center gap-2.5 border-b border-ac-line px-4">
          <Search className="h-4 w-4 text-ac-text-muted" strokeWidth={1.5} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search projects or run a command…"
            className="h-12 flex-1 bg-transparent text-[14px] text-ac-text outline-none placeholder:text-ac-text-muted"
            data-testid="command-input"
          />
          <Kbd>Esc</Kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <div className="px-3 py-8 text-center text-[13px] text-ac-text-muted">No matches for "{q}"</div>
          ) : (
            results.map((r, i) => (
              <button
                key={r.id}
                onMouseEnter={() => setActive(i)}
                onClick={() => runAt(i)}
                className={`flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-left ${i === active ? "bg-ac-surface" : ""}`}
                data-testid={`command-item-${r.id}`}
              >
                <r.icon className="h-4 w-4 text-ac-text-secondary" strokeWidth={1.5} />
                <span className="flex-1 text-[14px] text-ac-text">{r.label}</span>
                <span className="text-[11px] text-ac-text-muted">{r.hint}</span>
                {i === active && <CornerDownLeft className="h-3.5 w-3.5 text-ac-text-muted" strokeWidth={1.5} />}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
