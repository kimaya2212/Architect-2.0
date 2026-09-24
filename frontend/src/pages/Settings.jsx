import React, { useState } from "react";
import { toast } from "sonner";
import { Sun, Moon, Monitor, MessageSquare, Terminal, Keyboard, Github, Cloud } from "lucide-react";
import { Segmented } from "@/components/ds/Segmented";
import { Button } from "@/components/ds/Button";
import { Kbd } from "@/components/ds/Kbd";
import { Badge } from "@/components/ds/Badge";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

const SHORTCUTS = [
  { keys: ["⌘", "K"], label: "Open command palette" },
  { keys: ["⌘", "Enter"], label: "Send prompt" },
  { keys: ["?"], label: "Keyboard shortcuts" },
  { keys: ["G", "H"], label: "Go to Home" },
];

export default function Settings() {
  const { user, updatePrefs } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mode, setMode] = useState(user?.mode || "simple");
  const [saving, setSaving] = useState(false);

  const saveMode = async (m) => {
    setMode(m);
    setSaving(true);
    try { await updatePrefs({ mode: m }); toast(`Default set to ${m === "pro" ? "Pro" : "Simple"} mode`); }
    finally { setSaving(false); }
  };

  const initials = (user?.name || "U").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-ac-text">Settings</h1>
      <p className="mt-1 text-[14px] text-ac-text-muted">Manage your account, mode and appearance.</p>

      {/* Profile */}
      <section className="mt-8 rounded-[12px] border border-ac-line bg-ac-surface p-6">
        <h2 className="text-[15px] font-semibold text-ac-text">Profile</h2>
        <div className="mt-4 flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-ac-elevated text-[16px] font-semibold text-ac-text">
            {user?.picture ? <img src={user.picture} alt="" className="h-full w-full object-cover" /> : initials}
          </span>
          <div>
            <div className="text-[15px] font-medium text-ac-text">{user?.name}</div>
            <div className="text-[13px] text-ac-text-muted">{user?.email}</div>
            <Badge tone="accent" className="mt-1.5">Signed in with Google</Badge>
          </div>
        </div>
      </section>

      {/* Mode */}
      <section className="mt-4 rounded-[12px] border border-ac-line bg-ac-surface p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-ac-text">Default mode</h2>
            <p className="mt-1 text-[13px] text-ac-text-muted">Simple hides code; Pro shows files, terminal and logs.</p>
          </div>
          <Segmented
            testId="settings-mode-toggle"
            value={mode}
            onChange={saveMode}
            options={[
              { value: "simple", label: "Simple", icon: <MessageSquare className="h-3.5 w-3.5" /> },
              { value: "pro", label: "Pro", icon: <Terminal className="h-3.5 w-3.5" /> },
            ]}
          />
        </div>
      </section>

      {/* Appearance */}
      <section className="mt-4 rounded-[12px] border border-ac-line bg-ac-surface p-6">
        <h2 className="text-[15px] font-semibold text-ac-text">Appearance</h2>
        <p className="mt-1 text-[13px] text-ac-text-muted">Choose how Architect looks. System follows your device.</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[{ k: "light", i: Sun }, { k: "dark", i: Moon }, { k: "system", i: Monitor }].map((t) => (
            <button key={t.k} onClick={() => setTheme(t.k)} className={`flex items-center justify-center gap-2 rounded-[8px] border py-2.5 text-[13px] font-medium capitalize ${theme === t.k ? "border-ac-accent text-ac-text" : "border-ac-line text-ac-text-secondary hover:bg-ac-elevated"}`} data-testid={`settings-theme-${t.k}`}>
              <t.i className="h-4 w-4" strokeWidth={1.5} /> {t.k}
            </button>
          ))}
        </div>
      </section>

      {/* Connected accounts */}
      <section className="mt-4 rounded-[12px] border border-ac-line bg-ac-surface p-6">
        <h2 className="text-[15px] font-semibold text-ac-text">Connected accounts</h2>
        <div className="mt-4 space-y-2">
          {[{ i: Github, l: "GitHub", d: "Sync projects to your repos" }, { i: Cloud, l: "Architect Cloud", d: "Default deploy target", on: true }].map((c) => (
            <div key={c.l} className="flex items-center gap-3 rounded-[8px] border border-ac-line bg-ac-base p-3">
              <c.i className="h-4 w-4 text-ac-text-secondary" strokeWidth={1.5} />
              <div className="flex-1"><div className="text-[13px] font-medium text-ac-text">{c.l}</div><div className="text-[12px] text-ac-text-muted">{c.d}</div></div>
              <Button variant={c.on ? "secondary" : "outline"} size="sm" onClick={() => toast(c.l, { description: c.on ? "Already connected." : "Connect flow opens in the next phase." })}>{c.on ? "Connected" : "Connect"}</Button>
            </div>
          ))}
        </div>
      </section>

      {/* Shortcuts */}
      <section className="mt-4 rounded-[12px] border border-ac-line bg-ac-surface p-6">
        <div className="mb-3 flex items-center gap-2"><Keyboard className="h-4 w-4 text-ac-text-secondary" strokeWidth={1.5} /><h2 className="text-[15px] font-semibold text-ac-text">Keyboard shortcuts</h2></div>
        <div className="divide-y divide-ac-line">
          {SHORTCUTS.map((s) => (
            <div key={s.label} className="flex items-center justify-between py-2.5">
              <span className="text-[13px] text-ac-text-secondary">{s.label}</span>
              <span className="flex gap-1">{s.keys.map((k) => <Kbd key={k}>{k}</Kbd>)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Danger zone */}
      <section className="mt-4 rounded-[12px] border border-ac-danger/30 bg-ac-surface p-6">
        <h2 className="text-[15px] font-semibold text-ac-danger">Danger zone</h2>
        <p className="mt-1 text-[13px] text-ac-text-muted">Deleting your account removes all projects. This can't be undone.</p>
        <Button variant="danger" size="md" className="mt-4" onClick={() => toast("Delete account", { description: "This requires type-to-confirm and ships in the next phase." })} data-testid="delete-account">Delete account</Button>
      </section>
    </div>
  );
}
