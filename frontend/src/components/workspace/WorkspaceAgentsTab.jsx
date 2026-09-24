import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Plus, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ds/Button";
import { Badge } from "@/components/ds/Badge";
import { EmptyState } from "@/components/ds/EmptyState";
import api from "@/lib/api";

export function WorkspaceAgentsTab() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState(null);
  useEffect(() => { api.get("/agents").then((r) => setAgents(r.data)).catch(() => setAgents([])); }, []);

  return (
    <div className="h-full overflow-auto bg-ac-base p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-semibold text-ac-text">Agents in this project</h2>
          <p className="text-[13px] text-ac-text-muted">Test and tune the agents wired into your app.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate("/agents")} data-testid="ws-open-studio">Open Agents Studio <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} /></Button>
      </div>
      {agents === null ? (
        <div className="grid gap-3 sm:grid-cols-2">{[0, 1].map((i) => <div key={i} className="skeleton h-28 rounded-[12px]" />)}</div>
      ) : agents.length === 0 ? (
        <EmptyState icon={Bot} title="No agents yet" description="Create an agent to add AI actions to your app." action={<Button variant="primary" size="md" onClick={() => navigate("/agents")}><Plus className="h-4 w-4" /> New agent</Button>} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {agents.map((a) => (
            <button key={a.id} onClick={() => navigate(`/agents/${a.id}`)} className="rounded-[12px] border border-ac-line bg-ac-surface p-4 text-left transition-colors hover:border-ac-line-strong" data-testid={`ws-agent-${a.id}`}>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-ac-line bg-ac-elevated"><Bot className="h-4 w-4 text-ac-accent" strokeWidth={1.5} /></div>
                <span className="text-[14px] font-medium text-ac-text">{a.name}</span>
                <Badge tone="accent" className="ml-auto">{a.framework}</Badge>
              </div>
              <p className="mt-2 line-clamp-2 text-[12px] text-ac-text-muted">{a.goal}</p>
              <div className="mt-2 flex items-center gap-3 text-[11px] text-ac-text-muted"><span>{a.model}</span><span>·</span><span>{a.success_rate}% success</span></div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
