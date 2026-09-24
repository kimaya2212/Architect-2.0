import React, { useState } from "react";
import { toast } from "sonner";
import { Plus, Upload, Sparkles } from "lucide-react";
import { Button } from "@/components/ds/Button";

const COLUMNS = ["name", "plan", "mrr", "status"];
const INITIAL = [
  { name: "Acme Inc", plan: "Pro", mrr: "1200", status: "Active" },
  { name: "Globex", plan: "Team", mrr: "3400", status: "Active" },
  { name: "Initech", plan: "Free", mrr: "0", status: "Trial" },
  { name: "Umbrella", plan: "Pro", mrr: "1200", status: "Past due" },
];

export function DataTab({ pro }) {
  const [rows, setRows] = useState(INITIAL);
  const [editing, setEditing] = useState(null); // {r,c}

  const setCell = (r, c, v) => setRows((rs) => rs.map((row, i) => (i === r ? { ...row, [c]: v } : row)));
  const addRow = () => setRows((rs) => [...rs, { name: "New customer", plan: "Free", mrr: "0", status: "Trial" }]);

  return (
    <div className="flex h-full flex-col bg-ac-base">
      <div className="flex items-center gap-2 border-b border-ac-line px-4 py-2.5">
        <span className="text-[13px] font-medium text-ac-text">customers</span>
        <span className="text-[12px] text-ac-text-muted">{rows.length} rows</span>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => toast("Import CSV", { description: "Drop a .csv to bulk-import rows." })}><Upload className="h-4 w-4" strokeWidth={1.5} /> Import</Button>
          <Button variant="secondary" size="sm" onClick={() => toast("Ask Architect", { description: "Describe the change, e.g. 'add a signup_date column'." })}><Sparkles className="h-4 w-4" strokeWidth={1.5} /> Ask Architect</Button>
          <Button variant="primary" size="sm" onClick={addRow} data-testid="data-add-row"><Plus className="h-4 w-4" strokeWidth={2} /> Add row</Button>
        </div>
      </div>

      {pro && (
        <div className="flex items-center gap-3 border-b border-ac-line bg-ac-surface px-4 py-2 font-mono text-[11px] text-ac-text-muted">
          <span>schema: public.customers</span>
          <span>·</span>
          <span>4 columns</span>
          <span>·</span>
          <span>1 index (pk)</span>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <table className="w-full text-[13px]">
          <thead className="sticky top-0 bg-ac-surface">
            <tr>
              <th className="w-10 border-b border-ac-line px-3 py-2 text-left text-[11px] font-medium text-ac-text-muted">#</th>
              {COLUMNS.map((c) => (
                <th key={c} className="border-b border-ac-line px-3 py-2 text-left font-mono text-[12px] font-medium text-ac-text-secondary">{c}{pro && <span className="ml-1 text-ac-text-muted">{c === "mrr" ? "int" : "text"}</span>}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} className="hover:bg-ac-surface" data-testid={`data-row-${r}`}>
                <td className="border-b border-ac-line px-3 py-1.5 text-[11px] text-ac-text-muted">{r + 1}</td>
                {COLUMNS.map((c) => (
                  <td key={c} className="border-b border-ac-line px-1 py-0.5" onClick={() => setEditing({ r, c })}>
                    {editing?.r === r && editing?.c === c ? (
                      <input autoFocus value={row[c]} onChange={(e) => setCell(r, c, e.target.value)} onBlur={() => setEditing(null)} onKeyDown={(e) => e.key === "Enter" && setEditing(null)} className="focus-ring h-7 w-full rounded-[4px] border border-ac-accent bg-ac-base px-2 text-[13px] text-ac-text" data-testid={`data-input-${r}-${c}`} />
                    ) : (
                      <div className="cursor-text rounded-[4px] px-2 py-1 text-ac-text">{row[c]}</div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
