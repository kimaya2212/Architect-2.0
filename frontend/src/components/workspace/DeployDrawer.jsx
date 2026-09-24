import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  X, Check, Loader2, Rocket, Cloud, Triangle, Boxes, Copy, ExternalLink, Share2,
  Globe, ArrowRight, ShieldCheck, Database, Server, GitCommitHorizontal, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ds/Button";
import { cn } from "@/lib/utils";

// Believable QR-style SVG (decorative, deterministic from the URL)
function QrCode({ value, size = 132 }) {
  const N = 25;
  const cells = useMemo(() => {
    let h = 2166136261;
    for (let i = 0; i < value.length; i++) { h ^= value.charCodeAt(i); h = Math.imul(h, 16777619); }
    const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 1000) / 1000; };
    const g = Array.from({ length: N }, () => Array.from({ length: N }, () => rnd() > 0.5));
    const finder = (r, c) => {
      for (let i = -1; i <= 7; i++) for (let j = -1; j <= 7; j++) {
        const rr = r + i, cc = c + j;
        if (rr < 0 || cc < 0 || rr >= N || cc >= N) continue;
        const edge = i === 0 || i === 6 || j === 0 || j === 6;
        const core = i >= 2 && i <= 4 && j >= 2 && j <= 4;
        const inside = i >= 0 && i <= 6 && j >= 0 && j <= 6;
        g[rr][cc] = inside ? (edge || core) : false;
      }
    };
    finder(0, 0); finder(0, N - 7); finder(N - 7, 0);
    return g;
  }, [value]);
  const s = size / N;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-[6px] bg-white p-1" data-testid="deploy-qr">
      {cells.map((row, r) => row.map((on, c) => on ? <rect key={`${r}-${c}`} x={c * s} y={r * s} width={s} height={s} fill="#0B0C0E" /> : null))}
    </svg>
  );
}

const TARGETS = [
  { id: "cloud", label: "Architect Cloud", desc: "Instant *.architect.app URL", icon: Cloud },
  { id: "vercel", label: "Vercel", desc: "Deploy to your Vercel team", icon: Triangle },
  { id: "custom", label: "Custom (Docker)", desc: "Export a container", icon: Boxes },
];

const CHECKS = [
  { id: "build", label: "Build passes", icon: GitCommitHorizontal },
  { id: "env", label: "Environment variables set", icon: Server },
  { id: "db", label: "Database migrated", icon: Database },
  { id: "agents", label: "Agents healthy", icon: Sparkles },
  { id: "security", label: "Security scan", icon: ShieldCheck },
];

const DEPLOY_STEPS = ["Queued", "Building", "Optimizing", "Live"];

export function DeployDrawer({ open, onClose, project, pro, onDeployed }) {
  const [phase, setPhase] = useState("preflight"); // preflight | deploying | done
  const [checks, setChecks] = useState({});
  const [target, setTarget] = useState("cloud");
  const [env, setEnv] = useState("production");
  const [stepIdx, setStepIdx] = useState(0);
  const timers = useRef([]);

  const slug = (project?.name || "app").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24) || "app";
  const url = env === "production" ? `https://${slug}.architect.app` : `https://${slug}-preview.architect.app`;

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  useEffect(() => {
    if (!open) return;
    setPhase("preflight"); setChecks({}); setStepIdx(0);
    CHECKS.forEach((c, i) => {
      const t1 = setTimeout(() => setChecks((s) => ({ ...s, [c.id]: "checking" })), 200 + i * 260);
      const t2 = setTimeout(() => setChecks((s) => ({ ...s, [c.id]: "pass" })), 200 + i * 260 + 520);
      timers.current.push(t1, t2);
    });
    return clearTimers;
  }, [open]);

  const allPass = CHECKS.every((c) => checks[c.id] === "pass");

  const deploy = () => {
    setPhase("deploying"); setStepIdx(0);
    let i = 0;
    const run = () => {
      setStepIdx(i);
      const t = setTimeout(() => {
        i += 1;
        if (i < DEPLOY_STEPS.length) run();
        else { setPhase("done"); onDeployed?.(); }
      }, 1200);
      timers.current.push(t);
    };
    run();
  };

  const copy = () => { navigator.clipboard?.writeText(url); toast("Copied", { description: url }); };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 bg-black/40" />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 360, damping: 34 }} className="fixed right-0 top-0 z-50 flex h-full w-[420px] max-w-full flex-col border-l border-ac-line bg-ac-surface shadow-float" data-testid="deploy-drawer">
            <div className="flex items-center gap-2 border-b border-ac-line px-4 py-3">
              <Rocket className="h-4 w-4 text-ac-accent" strokeWidth={1.5} />
              <span className="text-[14px] font-semibold text-ac-text">{pro ? "Deploy" : "Publish"} {project?.name}</span>
              <button onClick={onClose} className="ml-auto rounded-[6px] p-1 text-ac-text-muted hover:bg-ac-elevated hover:text-ac-text"><X className="h-4 w-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {phase === "done" ? (
                <div className="animate-fade-up text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--ac-success)_18%,transparent)]"><Check className="h-6 w-6 text-ac-success" strokeWidth={2.5} /></div>
                  <h3 className="text-[18px] font-semibold tracking-[-0.01em] text-ac-text">You're live</h3>
                  <p className="mt-1 text-[13px] text-ac-text-muted">Your app is deployed to {env === "production" ? "production" : "preview"}.</p>

                  <div className="mt-5 flex items-center gap-2 rounded-[10px] border border-ac-line bg-ac-base p-2.5">
                    <Globe className="h-4 w-4 shrink-0 text-ac-text-muted" strokeWidth={1.5} />
                    <a href={url} target="_blank" rel="noreferrer" className="flex-1 truncate text-left font-mono text-[12px] text-ac-accent hover:underline" data-testid="deploy-url">{url}</a>
                    <button onClick={copy} className="rounded-[6px] p-1.5 text-ac-text-muted hover:bg-ac-elevated hover:text-ac-text" aria-label="Copy URL" data-testid="deploy-copy"><Copy className="h-3.5 w-3.5" /></button>
                  </div>

                  <div className="mt-4 flex justify-center"><QrCode value={url} /></div>
                  <p className="mt-2 text-[12px] text-ac-text-muted">Scan to open on your phone</p>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <Button variant="primary" size="md" onClick={() => window.open(url, "_blank")} data-testid="deploy-open"><ExternalLink className="h-4 w-4" strokeWidth={1.5} /> Open</Button>
                    <Button variant="secondary" size="md" onClick={() => { copy(); toast("Share link copied"); }} data-testid="deploy-share"><Share2 className="h-4 w-4" strokeWidth={1.5} /> Share</Button>
                  </div>

                  <button onClick={() => toast("Add custom domain", { description: "Enter a domain to see the DNS records to add." })} className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-[8px] border border-dashed border-ac-line py-2.5 text-[13px] text-ac-text-secondary hover:border-ac-line-strong hover:text-ac-text" data-testid="deploy-add-domain">
                    <Globe className="h-4 w-4" strokeWidth={1.5} /> Add a custom domain <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : phase === "deploying" ? (
                <div className="py-4">
                  <div className="relative pl-2">
                    <div className="absolute bottom-4 left-[13px] top-4 w-px bg-ac-line" />
                    {DEPLOY_STEPS.map((s, i) => (
                      <div key={s} className="relative flex items-center gap-3 py-3">
                        {i < stepIdx ? (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--ac-success)_20%,transparent)]"><Check className="h-3.5 w-3.5 text-ac-success" strokeWidth={3} /></span>
                        ) : i === stepIdx ? (
                          <span className="flex h-6 w-6 items-center justify-center"><Loader2 className="h-4 w-4 animate-spin text-ac-accent" /></span>
                        ) : (
                          <span className="flex h-6 w-6 items-center justify-center"><span className="h-2 w-2 rounded-full border border-ac-line-strong" /></span>
                        )}
                        <span className={cn("text-[14px]", i <= stepIdx ? "text-ac-text" : "text-ac-text-muted")}>{s}</span>
                        {i === stepIdx && <span className="text-[11px] text-ac-accent">in progress…</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {/* pre-flight */}
                  <div className="mb-2 text-[12px] font-medium uppercase tracking-wider text-ac-text-muted">Pre-flight</div>
                  <div className="space-y-1.5">
                    {CHECKS.map((c) => {
                      const st = checks[c.id];
                      return (
                        <div key={c.id} className="flex items-center gap-3 rounded-[8px] border border-ac-line bg-ac-base px-3 py-2.5" data-testid={`preflight-${c.id}`}>
                          <c.icon className="h-4 w-4 text-ac-text-muted" strokeWidth={1.5} />
                          <span className="flex-1 text-[13px] text-ac-text">{c.label}</span>
                          {st === "pass" ? <Check className="h-4 w-4 text-ac-success" strokeWidth={2.5} />
                            : st === "checking" ? <Loader2 className="h-4 w-4 animate-spin text-ac-text-muted" />
                            : <span className="h-4 w-4 rounded-full border border-ac-line-strong" />}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mb-2 mt-5 text-[12px] font-medium uppercase tracking-wider text-ac-text-muted">Target</div>
                  <div className="space-y-1.5">
                    {TARGETS.map((t) => (
                      <button key={t.id} onClick={() => setTarget(t.id)} className={cn("flex w-full items-center gap-3 rounded-[8px] border p-3 text-left", target === t.id ? "border-ac-accent bg-[color-mix(in_srgb,var(--ac-accent)_8%,transparent)]" : "border-ac-line hover:border-ac-line-strong")} data-testid={`target-${t.id}`}>
                        <t.icon className="h-4 w-4 text-ac-text-secondary" strokeWidth={1.5} />
                        <div className="flex-1"><div className="text-[13px] font-medium text-ac-text">{t.label}</div><div className="text-[12px] text-ac-text-muted">{t.desc}</div></div>
                        {target === t.id && <Check className="h-4 w-4 text-ac-accent" strokeWidth={2.5} />}
                      </button>
                    ))}
                  </div>

                  <div className="mb-2 mt-5 text-[12px] font-medium uppercase tracking-wider text-ac-text-muted">Environment</div>
                  <div className="inline-flex rounded-[8px] border border-ac-line bg-ac-elevated p-0.5">
                    {["preview", "production"].map((e) => (
                      <button key={e} onClick={() => setEnv(e)} className={cn("rounded-[6px] px-3 py-1.5 text-[13px] font-medium capitalize", env === e ? "bg-ac-surface text-ac-text border border-ac-line-strong" : "text-ac-text-muted")} data-testid={`env-${e}`}>{e}</button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {phase === "preflight" && (
              <div className="border-t border-ac-line p-4">
                <Button variant="primary" size="lg" className="w-full" disabled={!allPass} onClick={deploy} data-testid="deploy-confirm">
                  <Rocket className="h-4 w-4" strokeWidth={1.5} /> {allPass ? `${pro ? "Deploy" : "Publish"} to ${env}` : "Running checks…"}
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
