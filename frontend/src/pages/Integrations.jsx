import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, ExternalLink, Loader2, KeyRound, Plus, Eye, EyeOff, Copy, X } from "lucide-react";
import { Button } from "@/components/ds/Button";
import { Badge } from "@/components/ds/Badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

const CATALOG = [
  { id: "stripe", name: "Stripe", cat: "Payments", color: "#635BFF", desc: "Accept payments and manage billing." },
  { id: "resend", name: "Resend", cat: "Email", color: "#0B0C0E", desc: "Send transactional email." },
  { id: "supabase", name: "Supabase", cat: "Database", color: "#3ECF8E", desc: "Postgres, auth and storage." },
  { id: "openai", name: "OpenAI", cat: "AI", color: "#10A37F", desc: "GPT models for your agents." },
  { id: "anthropic", name: "Anthropic", cat: "AI", color: "#D97757", desc: "Claude models for your agents." },
  { id: "sheets", name: "Google Sheets", cat: "Data", color: "#0F9D58", desc: "Read and write spreadsheets." },
  { id: "slack", name: "Slack", cat: "Messaging", color: "#4A154B", desc: "Post messages and alerts." },
  { id: "twilio", name: "Twilio", cat: "Messaging", color: "#F22F46", desc: "Send SMS and WhatsApp." },
  { id: "clerk", name: "Clerk", cat: "Auth", color: "#6C47FF", desc: "Drop-in user authentication." },
];
const CATS = ["All", "AI", "Payments", "Email", "Database", "Messaging", "Auth", "Data"];

const SECRETS_SEED = [
  { key: "DATABASE_URL", scope: "Production", used: "db.ts" },
  { key: "STRIPE_SECRET_KEY", scope: "Production", used: "billing" },
  { key: "OPENAI_API_KEY", scope: "All", used: "agent" },
];

function ConnectModal({ item, open, onClose, onConnect }) {
  const [val, setVal] = useState("");
  const [show, setShow] = useState(false);
  const [testing, setTesting] = useState(false);
  const [tested, setTested] = useState(false);
  useEffect(() => { if (open) { setVal(""); setShow(false); setTested(false); } }, [open]);
  if (!item) return null;
  const test = () => { setTesting(true); setTimeout(() => { setTesting(false); setTested(true); toast("Connection works", { description: `${item.name} responded successfully.` }); }, 1100); };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="border-ac-line bg-ac-elevated" data-testid="connect-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-ac-text"><span className="flex h-6 w-6 items-center justify-center rounded-[6px] text-[12px] font-semibold text-white" style={{ background: item.color }}>{item.name[0]}</span> Connect {item.name}</DialogTitle>
          <DialogDescription className="text-ac-text-muted">Paste your API key. We store it encrypted and scoped to this workspace.</DialogDescription>
        </DialogHeader>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-[13px] font-medium text-ac-text-secondary">API key</label>
            <a href="#" onClick={(e) => { e.preventDefault(); toast("Where to find it", { description: `Open your ${item.name} dashboard → Developers → API keys.` }); }} className="text-[12px] text-ac-accent hover:underline">Where do I find this?</a>
          </div>
          <div className="relative">
            <input autoFocus type={show ? "text" : "password"} value={val} onChange={(e) => setVal(e.target.value)} placeholder={`${item.id}_live_…`} className="focus-ring h-10 w-full rounded-md border border-ac-line bg-ac-surface px-3 pr-10 font-mono text-[13px] text-ac-text" data-testid="connect-key-input" />
            <button onClick={() => setShow((s) => !s)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ac-text-muted hover:text-ac-text">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Button variant="secondary" size="md" onClick={test} loading={testing} disabled={!val.trim()} data-testid="test-connection">{tested ? <><Check className="h-4 w-4 text-ac-success" /> Tested</> : "Test connection"}</Button>
          <Button variant="primary" size="md" className="ml-auto" disabled={!val.trim()} onClick={() => { onConnect(item.id); onClose(); toast(`${item.name} connected`); }} data-testid="save-connection">Connect</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Integrations() {
  const [cat, setCat] = useState("All");
  const [connected, setConnected] = useState(() => JSON.parse(localStorage.getItem("ac_integrations") || "{}"));
  const [modal, setModal] = useState(null);
  const [secrets, setSecrets] = useState(SECRETS_SEED);
  const [revealed, setRevealed] = useState({});

  const save = (next) => { setConnected(next); localStorage.setItem("ac_integrations", JSON.stringify(next)); };
  const connect = (id) => save({ ...connected, [id]: true });
  const disconnect = (id) => { const n = { ...connected }; delete n[id]; save(n); toast("Disconnected"); };

  const list = CATALOG.filter((i) => cat === "All" || i.cat === cat);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-ac-text">Integrations</h1>
      <p className="mt-1 text-[14px] text-ac-text-muted">Connect the tools your app and agents rely on.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {CATS.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${cat === c ? "border-ac-accent text-ac-text" : "border-ac-line text-ac-text-secondary hover:border-ac-line-strong hover:text-ac-text"}`} data-testid={`int-cat-${c}`}>{c}</button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((i) => {
          const on = !!connected[i.id];
          return (
            <div key={i.id} className="rounded-[12px] border border-ac-line bg-ac-surface p-5" data-testid={`int-card-${i.id}`}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[10px] text-[15px] font-semibold text-white" style={{ background: i.color }}>{i.name[0]}</span>
                <div className="flex-1"><div className="text-[14px] font-medium text-ac-text">{i.name}</div><div className="text-[12px] text-ac-text-muted">{i.cat}</div></div>
                {on && <Badge tone="success"><Check className="h-3 w-3" /> Connected</Badge>}
              </div>
              <p className="mt-3 text-[13px] text-ac-text-muted">{i.desc}</p>
              <div className="mt-4">
                {on ? (
                  <Button variant="secondary" size="sm" className="w-full" onClick={() => disconnect(i.id)} data-testid={`disconnect-${i.id}`}>Disconnect</Button>
                ) : (
                  <Button variant="primary" size="sm" className="w-full" onClick={() => setModal(i)} data-testid={`connect-${i.id}`}><Plus className="h-4 w-4" strokeWidth={2} /> Connect</Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Secrets manager */}
      <div className="mt-12">
        <div className="mb-3 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-ac-text-secondary" strokeWidth={1.5} />
          <h2 className="text-[16px] font-semibold text-ac-text">Secrets</h2>
          <Button variant="secondary" size="sm" className="ml-auto" onClick={() => toast("Add secret", { description: "Paste a key/value or import a .env file." })} data-testid="add-secret"><Plus className="h-4 w-4" /> Add secret</Button>
        </div>
        <div className="overflow-hidden rounded-[12px] border border-ac-line">
          <table className="w-full text-[13px]">
            <thead className="bg-ac-surface text-ac-text-muted"><tr>{["Key", "Value", "Scope", "Used by"].map((h) => <th key={h} className="px-4 py-2.5 text-left text-[12px] font-medium">{h}</th>)}<th /></tr></thead>
            <tbody>
              {secrets.map((s, i) => (
                <tr key={s.key} className="border-t border-ac-line" data-testid={`secret-${s.key}`}>
                  <td className="px-4 py-2.5 font-mono text-ac-text">{s.key}</td>
                  <td className="px-4 py-2.5 font-mono text-ac-text-secondary">
                    <button onClick={() => setRevealed((r) => ({ ...r, [i]: !r[i] }))} className="inline-flex items-center gap-2 hover:text-ac-text">{revealed[i] ? "sk_live_9f2a…c71" : "••••••••••••"}{revealed[i] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
                  </td>
                  <td className="px-4 py-2.5"><Badge tone="outline">{s.scope}</Badge></td>
                  <td className="px-4 py-2.5 text-ac-text-muted">{s.used}</td>
                  <td className="px-4 py-2.5 text-right"><button onClick={() => { navigator.clipboard?.writeText(s.key); toast("Copied key name"); }} className="text-ac-text-muted hover:text-ac-text"><Copy className="h-3.5 w-3.5" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConnectModal item={modal} open={!!modal} onClose={() => setModal(null)} onConnect={connect} />
    </div>
  );
}
