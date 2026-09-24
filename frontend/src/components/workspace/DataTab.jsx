import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Upload, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ds/Button";
import api from "@/lib/api";

const COLUMNS = ["name", "plan", "mrr", "status"];

export function DataTab({ pro, projectId }) {
  const [rows, setRows] = useState(null);
  const [editing, setEditing] = useState(null); // {id, c}
  const [draft, setDraft] = useState("");

  const load = () => api.get(`/projects/${projectId}/data/rows`).then((r) => setRows(r.data)).catch(() => setRows([]));
  useEffect(() => { load(); }, [projectId]); // eslint-disable-line

  const beginEdit = (id, c, value) => { setEditing({ id, c }); setDraft(value); };
  const commit = async () => {
    if (!editing) return;
    const { id, c } = editing;
    const row = rows.find((r) => r.id === id);
    setEditing(null);
    if (row[c] === draft) return;
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [c]: draft } : r)));
    try { await api.patch(`/projects/${projectId}/data/rows/${id}`, { [c]: draft }); }
    catch (e) { toast("Couldn't save", { description: "Please try again." }); load(); }
  };

  const addRow = async () => {
    const r = await api.post(`/projects/${projectId}/data/rows`, {});
    setRows((rs) => [...rs, r.data]);
  };
  const delRow = async (id) => {
    setRows((rs) => rs.filter((r) => r.id !== id));
    await api.delete(`/projects/${projectId}/data/rows/${id}`).catch(() => load());
    toast("Row deleted");
  };

  return (
    <div className="flex h-full flex-col bg-ac-base">
      <div className="flex items-center gap-2 border-b border-ac-line px-4 py-2.5">
        <span className="text-[13px] font-medium text-ac-text">customers</span>
        <span className="text-[12px] text-ac-text-muted">{rows?.length ?? "—"} rows</span>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => toast("Import CSV", { description: "Drop a .csv to bulk-import rows." })}><Upload className="h-4 w-4" strokeWidth={1.5} /> Import</Button>
          <Button variant="secondary" size="sm" onClick={() => toast("Ask Architect", { description: "Describe the change, e.g. 'add a signup_date column'." })}><Sparkles className="h-4 w-4" strokeWidth={1.5} /> Ask Architect</Button>
          <Button variant="primary" size="sm" onClick={addRow} data-testid="data-add-row"><Plus className="h-4 w-4" strokeWidth={2} /> Add row</Button>
        </div>
      </div>

      {pro && (
        <div className="flex items-center gap-3 border-b border-ac-line bg-ac-surface px-4 py-2 font-mono text-[11px] text-ac-text-muted">
          <span>schema: public.customers</span><span>·</span><span>4 columns</span><span>·</span><span>1 index (pk)</span>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {rows === null ? (
          <div className="space-y-2 p-4">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-8 rounded" />)}</div>
        ) : (
          <table className="w-full text-[13px]">
            <thead className="sticky top-0 bg-ac-surface">
              <tr>
                <th className="w-10 border-b border-ac-line px-3 py-2 text-left text-[11px] font-medium text-ac-text-muted">#</th>
                {COLUMNS.map((c) => (
                  <th key={c} className="border-b border-ac-line px-3 py-2 text-left font-mono text-[12px] font-medium text-ac-text-secondary">{c}{pro && <span className="ml-1 text-ac-text-muted">{c === "mrr" ? "int" : "text"}</span>}</th>
                ))}
                <th className="w-10 border-b border-ac-line" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, r) => (
                <tr key={row.id} className="group hover:bg-ac-surface" data-testid={`data-row-${r}`}>
                  <td className="border-b border-ac-line px-3 py-1.5 text-[11px] text-ac-text-muted">{r + 1}</td>
                  {COLUMNS.map((c) => (
                    <td key={c} className="border-b border-ac-line px-1 py-0.5" onClick={() => beginEdit(row.id, c, row[c])}>
                      {editing?.id === row.id && editing?.c === c ? (
                        <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit} onKeyDown={(e) => e.key === "Enter" && commit()} className="focus-ring h-7 w-full rounded-[4px] border border-ac-accent bg-ac-base px-2 text-[13px] text-ac-text" data-testid={`data-input-${r}-${c}`} />
                      ) : (
                        <div className="cursor-text rounded-[4px] px-2 py-1 text-ac-text">{row[c]}</div>
                      )}
                    </td>
                  ))}
                  <td className="border-b border-ac-line px-1">
                    <button onClick={() => delRow(row.id)} className="rounded-[5px] p-1.5 text-ac-text-muted opacity-0 transition-opacity hover:bg-ac-elevated hover:text-ac-danger group-hover:opacity-100" aria-label="Delete row" data-testid={`data-del-${r}`}><Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
