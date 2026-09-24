import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, Wand2 } from "lucide-react";
import { Button } from "@/components/ds/Button";
import { Badge } from "@/components/ds/Badge";
import { TEMPLATES } from "@/lib/mockData";
import api from "@/lib/api";

const CHIPS = ["All", "Agents", "SaaS", "Internal tools", "Landing pages", "E-commerce"];
const TYPE_MAP = { SaaS: "fullstack", Agents: "agent", "Landing pages": "web", "Internal tools": "web", "E-commerce": "fullstack" };

export default function Templates() {
  const navigate = useNavigate();
  const [chip, setChip] = useState("All");
  const [busy, setBusy] = useState(null);
  const list = TEMPLATES.filter((t) => chip === "All" || t.tag === chip);

  const use = async (t) => {
    setBusy(t.id);
    try {
      const r = await api.post("/projects", { name: `${t.name}`, description: t.desc, type: TYPE_MAP[t.tag] || "web", framework: "Auto", prompt: `${t.name}. ${t.desc}` });
      toast("Building from template", { description: `Opening ${t.name} in the workspace.` });
      navigate(`/project/${r.data.id}?autobuild=1`);
    } finally { setBusy(null); }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-ac-text">Templates</h1>
      <p className="mt-1 text-[14px] text-ac-text-muted">Start from a proven blueprint, then make it yours.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {CHIPS.map((c) => (
          <button key={c} onClick={() => setChip(c)} className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${chip === c ? "border-ac-accent text-ac-text" : "border-ac-line text-ac-text-secondary hover:border-ac-line-strong hover:text-ac-text"}`} data-testid={`template-chip-${c}`}>{c}</button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => (
          <div key={t.id} className="group flex flex-col overflow-hidden rounded-[12px] border border-ac-line bg-ac-surface transition-colors hover:border-ac-line-strong" data-testid={`template-${t.id}`}>
            <div className="h-32 border-b border-ac-line bg-ac-base p-3">
              <div className="h-2 w-1/3 rounded bg-ac-line" />
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                <div className="h-12 rounded bg-ac-elevated" />
                <div className="h-12 rounded bg-ac-elevated" />
                <div className="h-12 rounded" style={{ background: "color-mix(in srgb, var(--ac-accent) 40%, transparent)" }} />
              </div>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-semibold text-ac-text">{t.name}</h3>
                <Badge tone="outline">{t.tag}</Badge>
              </div>
              <p className="mt-1.5 flex-1 text-[13px] text-ac-text-muted">{t.desc}</p>
              <div className="mt-4 flex gap-2">
                <Button variant="primary" size="sm" className="flex-1" loading={busy === t.id} onClick={() => use(t)} data-testid={`use-${t.id}`}><Wand2 className="h-4 w-4" strokeWidth={1.5} /> Use template</Button>
                <Button variant="secondary" size="sm" onClick={() => toast("Preview", { description: `A live preview of "${t.name}" opens in the next phase.` })} data-testid={`preview-${t.id}`}><Eye className="h-4 w-4" strokeWidth={1.5} /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
