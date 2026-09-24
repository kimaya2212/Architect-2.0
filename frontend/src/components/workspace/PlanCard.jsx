import React, { useState } from "react";
import { ChevronRight, Plus, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ds/Button";

const ICONS = { Pages: "📄", "Data model": "🗄", Integrations: "🔌", Agents: "🤖" };

export function PlanCard({ plan, approved, onApprove, onEdit }) {
  const [open, setOpen] = useState({ Pages: true });
  const [checks, setChecks] = useState({});
  const [extra, setExtra] = useState({});
  const [adding, setAdding] = useState(null);
  const [draft, setDraft] = useState("");

  const toggle = (k) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  const key = (s, i) => `${s}-${i}`;

  if (approved) {
    const total = Object.values(plan).reduce((a, v) => a + v.length, 0);
    return (
      <div className="rounded-[10px] border border-ac-line bg-ac-surface p-3">
        <div className="flex items-center gap-2 text-[13px] text-ac-text-secondary">
          <Check className="h-4 w-4 text-ac-success" strokeWidth={2} /> Plan approved · {total} items · building now
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[12px] border border-ac-line bg-ac-surface" data-testid="plan-card">
      <div className="flex items-center gap-2 border-b border-ac-line px-4 py-3">
        <Sparkles className="h-4 w-4 text-ac-accent" strokeWidth={1.5} />
        <span className="text-[14px] font-semibold text-ac-text">Build plan</span>
        <span className="ml-auto text-[12px] text-ac-text-muted">Review and tweak before building</span>
      </div>
      <div className="divide-y divide-ac-line">
        {Object.entries(plan).map(([section, items]) => {
          const all = [...items, ...(extra[section] || [])];
          if (all.length === 0) return null;
          return (
            <div key={section} className="px-2 py-1.5">
              <button onClick={() => toggle(section)} className="flex w-full items-center gap-2 rounded-[6px] px-2 py-1.5 hover:bg-ac-elevated" data-testid={`plan-section-${section}`}>
                <ChevronRight className={`h-3.5 w-3.5 text-ac-text-muted transition-transform ${open[section] ? "rotate-90" : ""}`} />
                <span className="text-[13px] font-medium text-ac-text">{section}</span>
                <span className="text-[11px] text-ac-text-muted">{all.length}</span>
              </button>
              {open[section] && (
                <div className="animate-fade-in space-y-0.5 pb-1 pl-6 pr-2">
                  {all.map((item, i) => {
                    const checked = checks[key(section, i)] !== false;
                    return (
                      <button key={i} onClick={() => setChecks((c) => ({ ...c, [key(section, i)]: !checked }))} className="flex w-full items-center gap-2 rounded-[6px] px-2 py-1 text-left hover:bg-ac-elevated" data-testid={`plan-item-${section}-${i}`}>
                        <span className={`flex h-4 w-4 items-center justify-center rounded-[4px] border ${checked ? "border-ac-accent bg-ac-accent" : "border-ac-line-strong"}`}>{checked && <Check className="h-3 w-3 text-ac-accent-text" strokeWidth={3} />}</span>
                        <span className={`text-[13px] ${checked ? "text-ac-text-secondary" : "text-ac-text-muted line-through"}`}>{item}</span>
                      </button>
                    );
                  })}
                  {adding === section ? (
                    <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={() => setAdding(null)}
                      onKeyDown={(e) => { if (e.key === "Enter" && draft.trim()) { setExtra((x) => ({ ...x, [section]: [...(x[section] || []), draft.trim()] })); setDraft(""); setAdding(null); } }}
                      placeholder="Add an item…" className="focus-ring ml-6 h-7 w-[calc(100%-1.5rem)] rounded-[5px] border border-ac-line bg-ac-base px-2 text-[12px] text-ac-text" data-testid={`plan-add-input-${section}`} />
                  ) : (
                    <button onClick={() => setAdding(section)} className="flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-[12px] text-ac-text-muted hover:text-ac-text-secondary" data-testid={`plan-add-${section}`}><Plus className="h-3 w-3" /> Add item</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 border-t border-ac-line px-4 py-3">
        <Button variant="primary" size="md" onClick={onApprove} data-testid="approve-build">Approve & build</Button>
        <Button variant="ghost" size="md" onClick={onEdit} data-testid="edit-plan">Edit in chat</Button>
      </div>
    </div>
  );
}
