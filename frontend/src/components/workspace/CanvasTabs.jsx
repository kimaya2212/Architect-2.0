import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Database, Bot, FileCode2, TerminalSquare, ScrollText, GitBranch } from "lucide-react";
import { PreviewTab } from "@/components/workspace/PreviewTab";
import { DataTab } from "@/components/workspace/DataTab";
import { WorkspaceAgentsTab } from "@/components/workspace/WorkspaceAgentsTab";
import { CodeTab } from "@/components/workspace/CodeTab";
import { TerminalTab } from "@/components/workspace/TerminalTab";
import { LogsTab } from "@/components/workspace/LogsTab";
import { GitTab } from "@/components/workspace/GitTab";
import { cn } from "@/lib/utils";

const SIMPLE_TABS = [
  { id: "preview", label: "Preview", icon: Eye },
  { id: "data", label: "Data", icon: Database },
  { id: "agents", label: "Agents", icon: Bot },
];
const PRO_TABS = [
  { id: "code", label: "Code", icon: FileCode2 },
  { id: "terminal", label: "Terminal", icon: TerminalSquare },
  { id: "logs", label: "Logs", icon: ScrollText },
  { id: "git", label: "Git", icon: GitBranch },
];

export function CanvasTabs({ projectId, mode, build, onElementSelect }) {
  const pro = mode === "pro";
  const key = `ac_tab_${projectId}`;
  const [active, setActive] = useState(() => localStorage.getItem(key) || "preview");

  const tabs = pro ? [...SIMPLE_TABS, ...PRO_TABS] : SIMPLE_TABS;

  useEffect(() => {
    if (!pro && PRO_TABS.some((t) => t.id === active)) setActive("preview");
  }, [pro, active]);

  useEffect(() => { localStorage.setItem(key, active); }, [active, key]);

  return (
    <div className="flex h-full flex-col">
      {/* tab bar */}
      <div className="flex items-center gap-0.5 overflow-x-auto border-b border-ac-line bg-ac-surface px-2">
        {SIMPLE_TABS.map((t) => <TabBtn key={t.id} t={t} active={active} setActive={setActive} />)}
        <AnimatePresence initial={false}>
          {pro && PRO_TABS.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.25, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
              <TabBtn t={t} active={active} setActive={setActive} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* content */}
      <div className="min-h-0 flex-1">
        {active === "preview" && <PreviewTab variant={build.variant} building={build.building} status={build.status} progress={build.progress} revealed={build.revealed} onElementSelect={onElementSelect} />}
        {active === "data" && <DataTab pro={pro} projectId={projectId} />}
        {active === "agents" && <WorkspaceAgentsTab />}
        {active === "code" && <CodeTab />}
        {active === "terminal" && <TerminalTab />}
        {active === "logs" && <LogsTab />}
        {active === "git" && <GitTab pro={pro} />}
      </div>
    </div>
  );
}

function TabBtn({ t, active, setActive }) {
  return (
    <button
      onClick={() => setActive(t.id)}
      data-testid={`canvas-tab-${t.id}`}
      className={cn(
        "relative flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap px-3 text-[13px] font-medium transition-colors",
        active === t.id ? "text-ac-text" : "text-ac-text-muted hover:text-ac-text-secondary"
      )}
    >
      <t.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
      {t.label}
      {active === t.id && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-ac-accent" />}
    </button>
  );
}
