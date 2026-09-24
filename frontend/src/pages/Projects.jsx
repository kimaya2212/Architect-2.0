import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, LayoutGrid, List, FolderGit2, ArchiveRestore, Trash2, FolderPlus } from "lucide-react";
import { Segmented } from "@/components/ds/Segmented";
import { Button } from "@/components/ds/Button";
import { EmptyState } from "@/components/ds/EmptyState";
import { ProjectCard } from "@/components/ProjectCard";
import { StatusChip } from "@/components/ds/StatusChip";
import api from "@/lib/api";

export default function Projects() {
  const [projects, setProjects] = useState(null);
  const [tab, setTab] = useState("active");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("grid");

  const load = () => api.get("/projects?include_archived=true").then((r) => setProjects(r.data)).catch(() => setProjects([]));
  useEffect(() => { load(); }, []);

  const active = useMemo(() => (projects || []).filter((p) => !p.archived), [projects]);
  const archived = useMemo(() => (projects || []).filter((p) => p.archived), [projects]);

  const shown = useMemo(() => {
    const src = tab === "active" ? active : archived;
    return src.filter((p) => (filter === "all" || p.status === filter) && (!q || p.name.toLowerCase().includes(q.toLowerCase())));
  }, [tab, active, archived, filter, q]);

  const restore = async (id) => { await api.patch(`/projects/${id}`, { archived: false }); load(); toast("Project restored"); };
  const del = async (id) => { await api.delete(`/projects/${id}`); load(); toast("Project deleted"); };
  const loadSample = async () => { await api.post("/projects/load-sample"); load(); toast("Sample data loaded"); };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-ac-text">Projects</h1>
          <p className="mt-1 text-[14px] text-ac-text-muted">{active.length} active · {archived.length} archived</p>
        </div>
        <Segmented testId="projects-tab" value={tab} onChange={setTab} options={[{ value: "active", label: "Active" }, { value: "archived", label: "Archived" }]} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ac-text-muted" strokeWidth={1.5} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects" className="focus-ring h-9 w-56 rounded-[6px] border border-ac-line bg-ac-surface pl-8 pr-2 text-[13px] text-ac-text placeholder:text-ac-text-muted" data-testid="projects-search-all" />
        </div>
        <div className="flex gap-1.5">
          {["all", "live", "building", "draft", "failed"].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`h-8 rounded-[6px] border px-2.5 text-[12px] font-medium capitalize ${filter === s ? "border-ac-accent text-ac-text" : "border-ac-line text-ac-text-muted hover:text-ac-text-secondary"}`} data-testid={`filter-${s}`}>{s === "all" ? "All" : s}</button>
          ))}
        </div>
        <div className="ml-auto">
          <Segmented testId="projects-view" size="sm" value={view} onChange={setView} options={[{ value: "grid", icon: <LayoutGrid className="h-3.5 w-3.5" /> }, { value: "list", icon: <List className="h-3.5 w-3.5" /> }]} />
        </div>
      </div>

      {projects === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-56 rounded-[12px]" />)}</div>
      ) : shown.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title={tab === "archived" ? "Nothing archived" : "No projects yet"}
          description={tab === "archived" ? "Archived projects will show up here." : "Create one from Home, or load sample projects to explore."}
          action={tab === "active" ? <Button variant="secondary" size="md" onClick={loadSample}><FolderPlus className="h-4 w-4" strokeWidth={1.5} /> Load sample data</Button> : null}
        />
      ) : tab === "archived" ? (
        <div className="space-y-2">
          {shown.map((p) => (
            <div key={p.id} className="flex items-center gap-4 rounded-[10px] border border-ac-line bg-ac-surface p-3" data-testid={`archived-row-${p.id}`}>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-medium text-ac-text">{p.name}</div>
                <div className="truncate text-[12px] text-ac-text-muted">{p.description || "No description"}</div>
              </div>
              <StatusChip status={p.status} />
              <Button variant="secondary" size="sm" onClick={() => restore(p.id)} data-testid={`restore-${p.id}`}><ArchiveRestore className="h-4 w-4" strokeWidth={1.5} /> Restore</Button>
              <Button variant="danger" size="sm" onClick={() => del(p.id)} data-testid={`del-archived-${p.id}`}><Trash2 className="h-4 w-4" strokeWidth={1.5} /></Button>
            </div>
          ))}
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{shown.map((p) => <ProjectCard key={p.id} project={p} onChanged={load} />)}</div>
      ) : (
        <div className="space-y-2">{shown.map((p) => <ProjectCard key={p.id} project={p} onChanged={load} view="list" />)}</div>
      )}
    </div>
  );
}
