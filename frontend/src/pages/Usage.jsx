import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Zap, TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ds/Button";
import { Badge } from "@/components/ds/Badge";
import api from "@/lib/api";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

const PLANS = [
  { name: "Free", price: "$0", credits: "200 / mo", features: ["3 projects", "Simple mode", "Community support"] },
  { name: "Pro", price: "$20", credits: "5,000 / mo", features: ["Unlimited projects", "Pro mode + export", "GitHub sync", "Custom domains"], current: true },
  { name: "Team", price: "$60", credits: "20,000 / mo", features: ["Everything in Pro", "Roles & sharing", "Unlimited agents", "Audit log"] },
];
const INVOICES = [
  { id: "INV-0007", date: "Jun 1, 2026", amt: "$20.00", status: "Paid" },
  { id: "INV-0006", date: "May 1, 2026", amt: "$20.00", status: "Paid" },
  { id: "INV-0005", date: "Apr 1, 2026", amt: "$20.00", status: "Paid" },
];

function Ring({ used, total }) {
  const pct = Math.min(1, used / total);
  const r = 52, c = 2 * Math.PI * r;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="var(--ac-border)" strokeWidth="12" />
      <circle cx="70" cy="70" r={r} fill="none" stroke="var(--ac-accent)" strokeWidth="12" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} transform="rotate(-90 70 70)" style={{ transition: "stroke-dashoffset 1s ease" }} />
      <text x="70" y="66" textAnchor="middle" className="fill-ac-text" style={{ fontSize: 22, fontWeight: 600 }}>{used}</text>
      <text x="70" y="86" textAnchor="middle" className="fill-ac-text-muted" style={{ fontSize: 11 }}>of {total}</text>
    </svg>
  );
}

export default function Usage() {
  const [projects, setProjects] = useState([]);
  const [upgrade, setUpgrade] = useState(false);
  useEffect(() => { api.get("/projects").then((r) => setProjects(r.data)).catch(() => {}); }, []);

  const used = 1240, total = 5000;
  const byProject = projects.slice(0, 6).map((p, i) => ({ name: p.name, credits: 90 + ((i * 137) % 300) }));
  const max = Math.max(1, ...byProject.map((b) => b.credits));

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-ac-text">Usage & billing</h1>
      <p className="mt-1 text-[14px] text-ac-text-muted">Track credits, review usage and manage your plan.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="flex items-center gap-5 rounded-[12px] border border-ac-line bg-ac-surface p-6">
          <Ring used={used} total={total} />
          <div>
            <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-ac-accent" strokeWidth={1.5} /><span className="text-[14px] font-medium text-ac-text">Credits this month</span></div>
            <p className="mt-1 text-[13px] text-ac-text-muted">Resets Jul 1. {total - used} left on the Pro plan.</p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={() => toast("Auto top-up enabled", { description: "We'll add credits when you run low." })} data-testid="autotopup">Enable auto top-up</Button>
          </div>
        </div>
        <div className="rounded-[12px] border border-ac-line bg-ac-surface p-6">
          <div className="mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-ac-text-secondary" strokeWidth={1.5} /><span className="text-[14px] font-medium text-ac-text">Usage by project</span></div>
          {byProject.length === 0 ? <p className="text-[13px] text-ac-text-muted">No usage yet.</p> : (
            <div className="space-y-2.5">
              {byProject.map((b) => (
                <div key={b.name}>
                  <div className="mb-1 flex justify-between text-[12px]"><span className="truncate text-ac-text-secondary">{b.name}</span><span className="font-mono text-ac-text-muted">{b.credits}</span></div>
                  <div className="h-1.5 rounded-full bg-ac-elevated"><div className="h-full rounded-full bg-ac-accent" style={{ width: `${(b.credits / max) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Plans */}
      <h2 className="mt-10 text-[16px] font-semibold text-ac-text">Plan</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => (
          <div key={p.name} className={`relative rounded-[12px] border bg-ac-surface p-5 ${p.current ? "border-ac-accent" : "border-ac-line"}`} data-testid={`plan-${p.name}`}>
            {p.current && <Badge tone="accent" className="absolute -top-3 left-5">Current</Badge>}
            <div className="text-[14px] font-semibold text-ac-text">{p.name}</div>
            <div className="mt-2 flex items-baseline gap-1"><span className="text-[26px] font-semibold text-ac-text">{p.price}</span><span className="text-[12px] text-ac-text-muted">/mo</span></div>
            <div className="mt-1 text-[12px] text-ac-text-muted">{p.credits} credits</div>
            <ul className="mt-3 space-y-1.5">{p.features.map((f) => <li key={f} className="flex items-center gap-2 text-[12px] text-ac-text-secondary"><Check className="h-3.5 w-3.5 text-ac-accent" /> {f}</li>)}</ul>
            {!p.current && <Button variant={p.name === "Team" ? "primary" : "secondary"} size="sm" className="mt-4 w-full" onClick={() => setUpgrade(true)} data-testid={`upgrade-${p.name}`}>{p.name === "Free" ? "Downgrade" : "Upgrade"}</Button>}
          </div>
        ))}
      </div>

      {/* Invoices */}
      <h2 className="mt-10 text-[16px] font-semibold text-ac-text">Invoices</h2>
      <div className="mt-4 overflow-hidden rounded-[12px] border border-ac-line">
        <table className="w-full text-[13px]">
          <thead className="bg-ac-surface text-ac-text-muted"><tr>{["Invoice", "Date", "Amount", "Status", ""].map((h) => <th key={h} className="px-4 py-2.5 text-left text-[12px] font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {INVOICES.map((inv) => (
              <tr key={inv.id} className="border-t border-ac-line">
                <td className="px-4 py-2.5 font-mono text-ac-text">{inv.id}</td>
                <td className="px-4 py-2.5 text-ac-text-secondary">{inv.date}</td>
                <td className="px-4 py-2.5 text-ac-text">{inv.amt}</td>
                <td className="px-4 py-2.5"><Badge tone="success">{inv.status}</Badge></td>
                <td className="px-4 py-2.5 text-right"><button onClick={() => toast("Downloading invoice", { description: inv.id })} className="text-ac-text-muted hover:text-ac-text"><Download className="h-3.5 w-3.5" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={upgrade} onOpenChange={setUpgrade}>
        <DialogContent className="border-ac-line bg-ac-elevated" data-testid="upgrade-modal">
          <DialogHeader><DialogTitle className="text-ac-text">Upgrade your plan</DialogTitle><DialogDescription className="text-ac-text-muted">You'll be charged the prorated difference today.</DialogDescription></DialogHeader>
          <div className="rounded-[10px] border border-ac-line bg-ac-surface p-4 text-[13px] text-ac-text-secondary">More credits, unlimited agents and priority support. Cancel anytime.</div>
          <Button variant="primary" size="md" className="mt-2 w-full" onClick={() => { setUpgrade(false); toast("Plan updated", { description: "Welcome to your new plan." }); }} data-testid="confirm-upgrade">Confirm upgrade</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
