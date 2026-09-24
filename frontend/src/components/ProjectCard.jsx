import React, { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Pencil, Copy, Archive, Trash2, Clock } from "lucide-react";
import { ProjectThumb } from "@/components/ProjectThumb";
import { StatusChip } from "@/components/ds/StatusChip";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { FRAMEWORK_TONE } from "@/lib/mockData";
import api from "@/lib/api";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";

function timeAgo(iso) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "just now";
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

export function ProjectCard({ project, onChanged, view = "grid" }) {
  const navigate = useNavigate();
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [name, setName] = useState(project.name);
  const [busy, setBusy] = useState(false);

  const open = () => navigate(`/project/${project.id}`);

  const doRename = async () => {
    setBusy(true);
    try { await api.patch(`/projects/${project.id}`, { name: name.trim() || project.name }); setRenameOpen(false); onChanged?.(); toast("Project renamed"); }
    finally { setBusy(false); }
  };
  const doDuplicate = async () => { await api.post(`/projects/${project.id}/duplicate`); onChanged?.(); toast("Project duplicated"); };
  const doArchive = async () => { await api.patch(`/projects/${project.id}`, { archived: true }); onChanged?.(); toast("Project archived", { description: "Find it in Projects → Archived." }); };
  const doDelete = async () => {
    setBusy(true);
    try { await api.delete(`/projects/${project.id}`); setDeleteOpen(false); onChanged?.(); toast("Project deleted"); }
    finally { setBusy(false); }
  };

  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-[6px] p-1.5 text-ac-text-muted opacity-0 transition-opacity hover:bg-ac-elevated hover:text-ac-text group-hover:opacity-100 focus:opacity-100" aria-label="Project actions" data-testid={`project-menu-${project.id}`} onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 border-ac-line bg-ac-elevated" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem className="text-ac-text-secondary" onClick={() => { setName(project.name); setRenameOpen(true); }}><Pencil className="mr-2 h-4 w-4" /> Rename</DropdownMenuItem>
        <DropdownMenuItem className="text-ac-text-secondary" onClick={doDuplicate}><Copy className="mr-2 h-4 w-4" /> Duplicate</DropdownMenuItem>
        <DropdownMenuItem className="text-ac-text-secondary" onClick={doArchive}><Archive className="mr-2 h-4 w-4" /> Archive</DropdownMenuItem>
        <DropdownMenuSeparator className="bg-ac-line" />
        <DropdownMenuItem className="text-ac-danger focus:text-ac-danger" onClick={() => setDeleteOpen(true)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const dialogs = (
    <>
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="border-ac-line bg-ac-elevated" data-testid="rename-dialog">
          <DialogHeader><DialogTitle className="text-ac-text">Rename project</DialogTitle>
            <DialogDescription className="text-ac-text-muted">Give this project a clear, memorable name.</DialogDescription>
          </DialogHeader>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doRename()} className="focus-ring h-10 w-full rounded-md border border-ac-line bg-ac-surface px-3 text-[14px] text-ac-text" data-testid="rename-input" />
          <DialogFooter>
            <Button variant="ghost" size="md" onClick={() => setRenameOpen(false)}>Cancel</Button>
            <Button variant="primary" size="md" onClick={doRename} loading={busy} data-testid="rename-save">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="border-ac-line bg-ac-elevated" data-testid="delete-dialog">
          <DialogHeader><DialogTitle className="text-ac-text">Delete this project?</DialogTitle>
            <DialogDescription className="text-ac-text-muted">This permanently removes the project and can't be undone.</DialogDescription>
          </DialogHeader>
          <p className="text-[14px] text-ac-text-muted">"{project.name}" will be permanently removed. This can't be undone.</p>
          <DialogFooter>
            <Button variant="ghost" size="md" onClick={() => setDeleteOpen(false)}>Keep it</Button>
            <Button variant="danger" size="md" onClick={doDelete} loading={busy} data-testid="delete-confirm">Delete project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  if (view === "list") {
    return (
      <div tabIndex={0} onClick={open} className="group flex cursor-pointer items-center gap-4 rounded-[10px] border border-ac-line bg-ac-surface p-3 transition-colors hover:border-ac-line-strong focus-ring" data-testid={`project-row-${project.id}`}>
        <ProjectThumb accent={project.accent} type={project.type} className="h-12 w-20 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-medium text-ac-text">{project.name}</div>
          <div className="truncate text-[12px] text-ac-text-muted">{project.description || "No description"}</div>
        </div>
        <Badge tone={FRAMEWORK_TONE[project.framework] || "outline"}>{project.framework}</Badge>
        <StatusChip status={project.status} />
        <span className="hidden w-20 items-center gap-1 text-[12px] text-ac-text-muted md:flex"><Clock className="h-3 w-3" /> {timeAgo(project.last_edited)}</span>
        {menu}
        {dialogs}
      </div>
    );
  }

  return (
    <div tabIndex={0} onClick={open} className="group cursor-pointer overflow-hidden rounded-[12px] border border-ac-line bg-ac-surface transition-all duration-150 hover:border-ac-line-strong hover:-translate-y-0.5 focus-ring" data-testid={`project-card-${project.id}`}>
      <ProjectThumb accent={project.accent} type={project.type} className="h-36" />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-[14px] font-semibold text-ac-text">{project.name}</h3>
            <p className="mt-0.5 line-clamp-1 text-[12px] text-ac-text-muted">{project.description || "No description"}</p>
          </div>
          {menu}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <StatusChip status={project.status} />
          <Badge tone={FRAMEWORK_TONE[project.framework] || "outline"}>{project.framework}</Badge>
          <span className="ml-auto flex items-center gap-1 text-[11px] text-ac-text-muted"><Clock className="h-3 w-3" /> {timeAgo(project.last_edited)}</span>
        </div>
      </div>
      {dialogs}
    </div>
  );
}
