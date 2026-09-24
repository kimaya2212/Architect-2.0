import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Share2, GitBranch, Clock, Rocket, Check, MessageSquare, Terminal as TermIcon,
  History, RotateCcw, X, Copy,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Segmented } from "@/components/ds/Segmented";
import { StatusChip } from "@/components/ds/StatusChip";
import { Button } from "@/components/ds/Button";
import { Logo } from "@/components/brand/Logo";
import { ChatPane } from "@/components/workspace/ChatPane";
import { CanvasTabs } from "@/components/workspace/CanvasTabs";
import { PageSkeleton } from "@/components/PageSkeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MODELS } from "@/lib/mockData";

const CHECKPOINTS = [
  { id: 1, label: "Added revenue chart", time: "2m ago" },
  { id: 2, label: "Wired authentication", time: "6m ago" },
  { id: 3, label: "Created database tables", time: "9m ago" },
  { id: 4, label: "Designed dashboard layout", time: "11m ago" },
  { id: 5, label: "Scaffolded project", time: "12m ago" },
  { id: 6, label: "Approved build plan", time: "13m ago" },
];

function SideDrawer({ open, onClose, title, icon: Icon, children, testId }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 bg-black/40" />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 360, damping: 34 }} className="fixed right-0 top-0 z-50 flex h-full w-[360px] flex-col border-l border-ac-line bg-ac-surface shadow-float" data-testid={testId}>
            <div className="flex items-center gap-2 border-b border-ac-line px-4 py-3">
              {Icon && <Icon className="h-4 w-4 text-ac-text-secondary" strokeWidth={1.5} />}
              <span className="text-[14px] font-semibold text-ac-text">{title}</span>
              <button onClick={onClose} className="ml-auto rounded-[6px] p-1 text-ac-text-muted hover:bg-ac-elevated hover:text-ac-text"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updatePrefs } = useAuth();
  const [project, setProject] = useState(null);
  const [mode, setMode] = useState("simple");
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState("");
  const [build, setBuild] = useState({ variant: "saas", building: false, status: "idle", progress: 0, revealed: 0 });
  const [elementChip, setElementChip] = useState(null);
  const [checkpointsOpen, setCheckpointsOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/projects/${id}`).then((r) => {
      setProject(r.data);
      setName(r.data.name);
      setMode(r.data.mode || user?.mode || "simple");
    }).catch(() => setNotFound(true));
  }, [id]); // eslint-disable-line

  const toggleMode = (m) => {
    setMode(m);
    api.patch(`/projects/${id}`, { mode: m }).catch(() => {});
    updatePrefs({ mode: m }).catch(() => {});
  };

  const saveName = () => {
    setRenaming(false);
    const v = name.trim() || project.name;
    setName(v);
    setProject((p) => ({ ...p, name: v }));
    api.patch(`/projects/${id}`, { name: v }).catch(() => {});
  };

  const onElementSelect = (label) => { setElementChip(label); toast("Element selected", { description: `Describe your change to the ${label.toLowerCase()} in chat.` }); };

  const deploy = () => toast("Deploy pre-flight", { description: "Build passes · Env set · Agents healthy. One-click publish opens in the deploy phase." });

  if (notFound) return (
    <div className="flex h-screen flex-col items-center justify-center bg-ac-base">
      <p className="text-[15px] text-ac-text">This project doesn't exist.</p>
      <Button variant="secondary" size="md" className="mt-4" onClick={() => navigate("/home")}>Back to Home</Button>
    </div>
  );
  if (!project) return <PageSkeleton />;

  const pro = mode === "pro";
  const errorsCount = 0;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-ac-base">
      {/* top bar */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-ac-line bg-ac-surface px-3">
        <button onClick={() => navigate("/home")} className="rounded-[6px] p-1.5 text-ac-text-muted hover:bg-ac-elevated hover:text-ac-text" aria-label="Back" data-testid="workspace-back"><ArrowLeft className="h-4 w-4" strokeWidth={1.5} /></button>
        <Logo showWord={false} size={18} />
        {renaming ? (
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onBlur={saveName} onKeyDown={(e) => e.key === "Enter" && saveName()} className="focus-ring h-8 w-56 rounded-[6px] border border-ac-line bg-ac-base px-2 text-[14px] font-medium text-ac-text" data-testid="workspace-rename-input" />
        ) : (
          <button onClick={() => setRenaming(true)} className="rounded-[6px] px-2 py-1 text-[14px] font-medium text-ac-text hover:bg-ac-elevated" data-testid="workspace-name">{name}</button>
        )}
        <StatusChip status={build.status === "building" ? "building" : build.status === "done" ? "live" : project.status} />

        <div className="mx-auto">
          <Segmented
            testId="workspace-mode-toggle" value={mode} onChange={toggleMode}
            options={[
              { value: "simple", label: "Simple", icon: <MessageSquare className="h-3.5 w-3.5" /> },
              { value: "pro", label: "Pro", icon: <TermIcon className="h-3.5 w-3.5" /> },
            ]}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={() => toast("Share", { description: "Invite by email or turn on a public preview link." })} data-testid="workspace-share"><Share2 className="h-4 w-4" strokeWidth={1.5} /> Share</Button>
          <button onClick={() => toast("GitHub", { description: "Each chat session works on its own branch: chat/session-1." })} className="hidden items-center gap-1.5 rounded-[6px] border border-ac-line px-2.5 py-1.5 text-[12px] text-ac-text-secondary hover:text-ac-text md:flex" data-testid="workspace-branch"><GitBranch className="h-3.5 w-3.5" strokeWidth={1.5} /> chat/session-1</button>
          <button onClick={() => setCheckpointsOpen(true)} className="rounded-[6px] p-1.5 text-ac-text-muted hover:bg-ac-elevated hover:text-ac-text" aria-label="Checkpoints" data-testid="workspace-checkpoints"><Clock className="h-4 w-4" strokeWidth={1.5} /></button>
          <Button variant="primary" size="sm" onClick={deploy} data-testid="workspace-deploy"><Rocket className="h-4 w-4" strokeWidth={1.5} /> {pro ? "Deploy" : "Publish"}</Button>
        </div>
      </header>

      {/* panes */}
      <div className="min-h-0 flex-1">
        <PanelGroup direction="horizontal" autoSaveId="ac-workspace-panes">
          <Panel defaultSize={34} minSize={24} maxSize={55} className="min-w-0">
            <ChatPane project={project} pro={pro} onBuildChange={setBuild} elementChip={elementChip} onClearChip={() => setElementChip(null)} onOpenDiff={() => toast(pro ? "Diff viewer" : "Changes", { description: "14 files changed · +820 −12" })} />
          </Panel>
          <PanelResizeHandle className="group relative w-px bg-ac-line data-[resize-handle-state=hover]:bg-ac-accent data-[resize-handle-state=drag]:bg-ac-accent">
            <div className="absolute inset-y-0 -left-1 -right-1" />
          </PanelResizeHandle>
          <Panel minSize={40} className="min-w-0">
            <div className="flex h-full flex-col">
              <div className="min-h-0 flex-1">
                <CanvasTabs projectId={project.id} mode={mode} build={build} onElementSelect={onElementSelect} />
              </div>
              {/* Pro status bar */}
              <AnimatePresence>
                {pro && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 28, opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="flex shrink-0 items-center gap-4 overflow-hidden border-t border-ac-line bg-ac-surface px-3 font-mono text-[11px] text-ac-text-muted" data-testid="pro-status-bar">
                    <span className="flex items-center gap-1"><GitBranch className="h-3 w-3" /> chat/session-1</span>
                    <span className="flex items-center gap-1"><Check className="h-3 w-3 text-ac-success" /> build passing</span>
                    <span className={errorsCount ? "text-ac-danger" : ""}>{errorsCount} errors</span>
                    <span className="ml-auto">:3000</span>
                    <span>{MODELS[0]}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Panel>
        </PanelGroup>
      </div>

      <SideDrawer open={checkpointsOpen} onClose={() => setCheckpointsOpen(false)} title="Checkpoints" icon={History} testId="checkpoints-drawer">
        <div className="space-y-1.5">
          {CHECKPOINTS.map((c) => (
            <div key={c.id} className="group flex items-center gap-3 rounded-[8px] border border-ac-line bg-ac-base p-3">
              <div className="h-1.5 w-1.5 rounded-full bg-ac-accent" />
              <div className="min-w-0 flex-1"><div className="truncate text-[13px] text-ac-text">{c.label}</div><div className="text-[11px] text-ac-text-muted">{c.time}</div></div>
              <button onClick={() => toast("Checkpoint restored", { description: c.label, action: { label: "Undo", onClick: () => toast("Restore undone") } })} className="flex items-center gap-1 rounded-[6px] px-2 py-1 text-[12px] text-ac-text-secondary opacity-0 transition-opacity hover:bg-ac-elevated hover:text-ac-text group-hover:opacity-100" data-testid={`restore-checkpoint-${c.id}`}><RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} /> Restore</button>
            </div>
          ))}
        </div>
      </SideDrawer>
    </div>
  );
}
