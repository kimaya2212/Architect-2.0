import React from "react";
import { toast } from "sonner";
import { GitBranch, GitCommit, GitPullRequest, Github, Check } from "lucide-react";
import { Button } from "@/components/ds/Button";
import { Badge } from "@/components/ds/Badge";

const COMMITS = [
  { msg: "Add revenue chart and KPI cards", author: "Architect", time: "2m", hash: "a1b2c3d" },
  { msg: "Wire authentication and protected routes", author: "Architect", time: "6m", hash: "e4f5g6h" },
  { msg: "Create customers and invoices tables", author: "Architect", time: "9m", hash: "i7j8k9l" },
  { msg: "Scaffold Next.js project", author: "Architect", time: "12m", hash: "m0n1o2p" },
];

const DIFF = [
  { t: "meta", v: "components/RevenueChart.tsx" },
  { t: "add", v: "+ export function RevenueChart({ series }) {" },
  { t: "add", v: "+   return <LineChart data={series} x=\"month\" y=\"revenue\" />;" },
  { t: "add", v: "+ }" },
  { t: "ctx", v: "  // rendered on the dashboard" },
  { t: "del", v: "- const Placeholder = () => null;" },
];

export function GitTab({ pro }) {
  if (!pro) {
    return (
      <div className="flex h-full items-center justify-center bg-ac-base p-8">
        <div className="w-full max-w-sm rounded-[14px] border border-ac-line bg-ac-surface p-6 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--ac-success)_16%,transparent)]"><Check className="h-5 w-5 text-ac-success" /></div>
          <h3 className="text-[15px] font-semibold text-ac-text">Your code is saved to GitHub</h3>
          <p className="mt-1.5 text-[13px] text-ac-text-muted">Last saved 2 minutes ago on branch <span className="font-mono">chat/session-1</span>.</p>
          <Button variant="secondary" size="md" className="mt-4 w-full" onClick={() => toast("Open on GitHub", { description: "Opens your repo in a new tab in production." })}><Github className="h-4 w-4" strokeWidth={1.5} /> View on GitHub</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-ac-base">
      <div className="flex items-center gap-2 border-b border-ac-line px-4 py-2.5">
        <GitBranch className="h-4 w-4 text-ac-text-secondary" strokeWidth={1.5} />
        <span className="font-mono text-[13px] text-ac-text">chat/session-1</span>
        <Badge tone="success" className="ml-1">Synced · 2m ago</Badge>
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => toast("Pull from upstream", { description: "No conflicts — you're up to date." })}>Pull</Button>
          <Button variant="primary" size="sm" onClick={() => toast("Draft pull request", { description: "AI-written title and description are ready to review." })}><GitPullRequest className="h-4 w-4" strokeWidth={1.5} /> Open PR</Button>
        </div>
      </div>
      <div className="grid flex-1 grid-cols-2 overflow-hidden">
        <div className="overflow-auto border-r border-ac-line">
          {COMMITS.map((c) => (
            <div key={c.hash} className="flex items-start gap-3 border-b border-ac-line px-4 py-3 hover:bg-ac-surface">
              <GitCommit className="mt-0.5 h-4 w-4 text-ac-text-muted" strokeWidth={1.5} />
              <div className="min-w-0">
                <div className="text-[13px] text-ac-text">{c.msg}</div>
                <div className="mt-0.5 text-[11px] text-ac-text-muted">{c.author} · {c.time} ago · <span className="font-mono">{c.hash}</span></div>
              </div>
            </div>
          ))}
        </div>
        <div className="overflow-auto p-3 font-mono text-[12px] leading-relaxed">
          {DIFF.map((d, i) => (
            <div key={i} className={
              d.t === "add" ? "bg-[color-mix(in_srgb,var(--ac-success)_12%,transparent)] text-ac-success" :
              d.t === "del" ? "bg-[color-mix(in_srgb,var(--ac-danger)_12%,transparent)] text-ac-danger" :
              d.t === "meta" ? "text-ac-text-muted" : "text-ac-text-secondary"
            }>{d.v}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
