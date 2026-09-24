import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Check, Sparkles, Terminal, MessageSquare, GitBranch, Rocket,
  ChevronDown, Play, Boxes, Database, ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ds/Button";
import { Badge } from "@/components/ds/Badge";
import { Segmented } from "@/components/ds/Segmented";
import { useTheme } from "@/context/ThemeContext";
import { TEMPLATES, FRAMEWORK_LOGOS } from "@/lib/mockData";

const NAV = [
  { label: "Product", href: "#product" },
  { label: "Templates", href: "#templates" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#faq" },
];

const BUILD_STEPS = ["Setting up project", "Creating database", "Designing pages", "Wiring authentication", "Running checks"];

function BuildDemo() {
  const [phase, setPhase] = useState(0); // 0 prompt, 1 plan, 2 build, 3 preview
  const [step, setStep] = useState(0);

  useEffect(() => {
    let t;
    if (phase === 0) t = setTimeout(() => setPhase(1), 2200);
    else if (phase === 1) t = setTimeout(() => setPhase(2), 2400);
    else if (phase === 2) {
      if (step < BUILD_STEPS.length) t = setTimeout(() => setStep((s) => s + 1), 700);
      else t = setTimeout(() => setPhase(3), 700);
    } else if (phase === 3) t = setTimeout(() => { setPhase(0); setStep(0); }, 3200);
    return () => clearTimeout(t);
  }, [phase, step]);

  return (
    <div className="rounded-[14px] border border-ac-line bg-ac-surface p-2 shadow-float">
      <div className="flex items-center gap-2 px-2 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-ac-danger/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-ac-warning/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-ac-success/50" />
        <span className="ml-2 font-mono text-[12px] text-ac-text-muted">architect.app/new</span>
        <span className="ml-auto flex items-center gap-1.5 text-[12px] text-ac-text-muted">
          <span className={`h-1.5 w-1.5 rounded-full ${phase >= 2 && phase < 3 ? "bg-ac-warning animate-pulse" : "bg-ac-success"}`} />
          {phase >= 3 ? "Live" : phase >= 2 ? "Building" : "Draft"}
        </span>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {/* left: chat */}
        <div className="min-h-[280px] rounded-[10px] border border-ac-line bg-ac-base p-4">
          <div className="ml-auto w-fit max-w-[85%] rounded-[10px] rounded-tr-[3px] bg-ac-elevated px-3 py-2 text-[13px] text-ac-text">
            Build a SaaS dashboard with revenue charts and a customers table.
          </div>
          {phase >= 1 && (
            <div className="mt-4 animate-fade-up rounded-[10px] border border-ac-line bg-ac-surface p-3">
              <div className="mb-2 flex items-center gap-2 text-[12px] font-medium text-ac-text-secondary">
                <Sparkles className="h-3.5 w-3.5 text-ac-accent" strokeWidth={1.5} /> Plan
              </div>
              {["Dashboard, Customers, Settings pages", "Postgres: customers, invoices", "Stripe billing + auth"].map((p, i) => (
                <div key={i} className="flex items-center gap-2 py-1 text-[13px] text-ac-text-secondary">
                  <Check className="h-3.5 w-3.5 text-ac-success" strokeWidth={2} /> {p}
                </div>
              ))}
            </div>
          )}
          {phase >= 2 && (
            <div className="mt-3 space-y-1.5">
              {BUILD_STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2 text-[12px]">
                  {i < step ? (
                    <Check className="h-3.5 w-3.5 text-ac-success" strokeWidth={2} />
                  ) : i === step && phase === 2 ? (
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-ac-accent border-t-transparent animate-spin" />
                  ) : (
                    <span className="h-3.5 w-3.5 rounded-full border border-ac-line" />
                  )}
                  <span className={i <= step ? "text-ac-text-secondary" : "text-ac-text-muted"}>{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* right: preview */}
        <div className="relative min-h-[280px] overflow-hidden rounded-[10px] border border-ac-line bg-ac-base p-4">
          {phase < 3 ? (
            <div className="space-y-3">
              <div className="skeleton h-6 w-1/3 rounded" />
              <div className="grid grid-cols-2 gap-3">
                <div className="skeleton h-16 rounded-[8px]" />
                <div className="skeleton h-16 rounded-[8px]" />
              </div>
              <div className="skeleton h-28 rounded-[8px]" />
            </div>
          ) : (
            <div className="animate-fade-in space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[14px] font-semibold text-ac-text">Revenue</div>
                <Badge tone="accent">+18%</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[8px] border border-ac-line bg-ac-surface p-3">
                  <div className="text-[11px] text-ac-text-muted">MRR</div>
                  <div className="text-[18px] font-semibold text-ac-text">$48.2k</div>
                </div>
                <div className="rounded-[8px] border border-ac-line bg-ac-surface p-3">
                  <div className="text-[11px] text-ac-text-muted">Customers</div>
                  <div className="text-[18px] font-semibold text-ac-text">1,284</div>
                </div>
              </div>
              <div className="flex h-24 items-end gap-1.5 rounded-[8px] border border-ac-line bg-ac-surface p-3">
                {[40, 55, 45, 70, 60, 82, 74, 92, 88].map((h, i) => (
                  <span key={i} className="flex-1 rounded-[2px] bg-ac-accent" style={{ height: `${h}%`, opacity: 0.5 + i * 0.05 }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CompareToggle() {
  const [mode, setMode] = useState("simple");
  return (
    <div className="rounded-[14px] border border-ac-line bg-ac-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[14px] font-medium text-ac-text">See both modes</span>
        <Segmented
          testId="landing-mode-toggle"
          value={mode}
          onChange={setMode}
          options={[{ value: "simple", label: "Simple" }, { value: "pro", label: "Pro" }]}
        />
      </div>
      <div className="overflow-hidden rounded-[10px] border border-ac-line bg-ac-base">
        <div className="flex items-center gap-2 border-b border-ac-line px-3 py-2 font-mono text-[12px] text-ac-text-muted">
          {mode === "simple" ? <><MessageSquare className="h-3.5 w-3.5" /> Chat · Preview · Deploy</> : <><Terminal className="h-3.5 w-3.5" /> Chat · Code · Terminal · Logs · Git</>}
        </div>
        <div className="grid grid-cols-3 gap-2 p-3">
          <div className="col-span-1 space-y-1.5 rounded-[8px] border border-ac-line bg-ac-surface p-2">
            <div className="h-1.5 w-2/3 rounded bg-ac-line" />
            <div className="h-1.5 w-full rounded bg-ac-line" />
            <div className="h-1.5 w-1/2 rounded bg-ac-line" />
          </div>
          <div className="col-span-2 space-y-2 rounded-[8px] border border-ac-line bg-ac-surface p-2">
            {mode === "simple" ? (
              <>
                <div className="h-3 w-1/3 rounded bg-ac-accent/70" />
                <div className="skeleton h-14 rounded" />
              </>
            ) : (
              <div className="font-mono text-[11px] leading-relaxed text-ac-text-secondary">
                <div><span className="text-ac-accent">const</span> app = express();</div>
                <div><span className="text-ac-info">app</span>.get(<span className="text-ac-success">'/api'</span>, handler);</div>
                <div className="text-ac-text-muted">$ npm run dev — ready on :3000</div>
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="mt-3 text-[13px] text-ac-text-muted">
        {mode === "simple" ? "Plain-English chat, a live preview, and one button to publish." : "The same project with files, a real terminal, diffs, logs and Git."}
      </p>
    </div>
  );
}

const FAQS = [
  { q: "Do I own the code?", a: "Yes. Every project is yours — download the source as a .zip or push to your own GitHub repo any time." },
  { q: "Can I self-host what I build?", a: "Deploy to Architect Cloud in one click, or export and host anywhere that runs your stack." },
  { q: "Do I need my own API keys?", a: "No to start. Add your own model provider keys later from the Integrations hub when you want full control." },
  { q: "Is it for non-developers?", a: "Simple mode is plain-English only. Developers can flip to Pro for code, terminal, logs and traces — same project." },
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="mx-auto max-w-2xl divide-y divide-ac-line rounded-[12px] border border-ac-line bg-ac-surface">
      {FAQS.map((f, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? -1 : i)}
            className="flex w-full items-center justify-between px-5 py-4 text-left"
            data-testid={`faq-${i}`}
          >
            <span className="text-[14px] font-medium text-ac-text">{f.q}</span>
            <ChevronDown className={`h-4 w-4 text-ac-text-muted transition-transform duration-200 ${open === i ? "rotate-180" : ""}`} strokeWidth={1.5} />
          </button>
          {open === i && <p className="animate-fade-in px-5 pb-4 text-[14px] leading-relaxed text-ac-text-muted">{f.a}</p>}
        </div>
      ))}
    </div>
  );
}

const PRICING = [
  { name: "Free", price: "$0", tag: "", desc: "For trying ideas.", features: ["3 projects", "Simple mode", "Architect Cloud preview", "Community support"], cta: "Start free" },
  { name: "Pro", price: "$20", tag: "Popular", desc: "For builders shipping real apps.", features: ["Unlimited projects", "Pro mode + code export", "GitHub sync", "Custom domains", "1 agent in production"], cta: "Start Pro" },
  { name: "Team", price: "$60", tag: "", desc: "For teams building together.", features: ["Everything in Pro", "Roles & sharing", "Unlimited agents", "Audit log", "Priority support"], cta: "Start Team" },
];

export default function Landing() {
  const { resolved, setTheme } = useTheme();
  return (
    <div className="min-h-screen bg-ac-base">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-ac-line bg-ac-base/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-5">
          <Link to="/" data-testid="landing-logo"><Logo /></Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <a key={n.label} href={n.href} className="rounded-md px-3 py-1.5 text-[13px] text-ac-text-secondary transition-colors hover:bg-ac-elevated hover:text-ac-text">{n.label}</a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setTheme(resolved === "dark" ? "light" : "dark")} className="rounded-md p-2 text-ac-text-muted hover:bg-ac-elevated hover:text-ac-text" aria-label="Toggle theme" data-testid="landing-theme-toggle">
              {resolved === "dark" ? "☾" : "☀"}
            </button>
            <Link to="/login"><Button variant="ghost" size="sm" data-testid="nav-signin">Sign in</Button></Link>
            <Link to="/signup"><Button variant="primary" size="sm" data-testid="nav-start">Start building</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="product" className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid bg-radial-fade opacity-40" />
        <div className="relative mx-auto max-w-6xl px-5 pb-8 pt-16 text-center md:pt-24">
          <Badge tone="outline" className="mx-auto mb-6 animate-fade-up">
            <Sparkles className="h-3.5 w-3.5 text-ac-accent" strokeWidth={1.5} /> One workspace, two depths
          </Badge>
          <h1 className="mx-auto max-w-3xl animate-fade-up text-[36px] font-semibold leading-[1.05] tracking-[-0.02em] text-ac-text md:text-[44px]" style={{ animationDelay: "60ms" }}>
            Describe it. Ship it. Own the code.
          </h1>
          <p className="mx-auto mt-5 max-w-xl animate-fade-up text-[16px] leading-relaxed text-ac-text-secondary" style={{ animationDelay: "120ms" }}>
            The vibe-coding platform for founders who don't code and developers who do. Build apps and AI agents in plain language, then take the wheel whenever you want.
          </p>
          <div className="mt-8 flex animate-fade-up items-center justify-center gap-3" style={{ animationDelay: "180ms" }}>
            <Link to="/signup"><Button variant="primary" size="lg" data-testid="hero-start">Start building <ArrowRight className="h-4 w-4" strokeWidth={1.5} /></Button></Link>
            <a href="#product"><Button variant="secondary" size="lg"><Play className="h-4 w-4" strokeWidth={1.5} /> Watch it build</Button></a>
          </div>
          <div className="mx-auto mt-14 max-w-4xl animate-fade-up" style={{ animationDelay: "240ms" }}>
            <BuildDemo />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-center text-[28px] font-semibold tracking-[-0.02em] text-ac-text">How it works</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { icon: MessageSquare, title: "Describe", desc: "Type what you want in plain language. Attach a screenshot, Figma link or a URL to clone." },
            { icon: Sparkles, title: "Architect builds", desc: "Approve a plan, then watch pages, data and agents come to life on a live timeline." },
            { icon: Rocket, title: "Deploy & own", desc: "Publish to a live URL in one click. Export the code or push to GitHub any time." },
          ].map((s, i) => (
            <div key={i} className="rounded-[12px] border border-ac-line bg-ac-surface p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[10px] border border-ac-line bg-ac-elevated">
                <s.icon className="h-5 w-5 text-ac-accent" strokeWidth={1.5} />
              </div>
              <div className="mb-1 flex items-center gap-2">
                <span className="font-mono text-[12px] text-ac-text-muted">0{i + 1}</span>
                <h3 className="text-[16px] font-semibold text-ac-text">{s.title}</h3>
              </div>
              <p className="text-[14px] leading-relaxed text-ac-text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For everyone / developers */}
      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-ac-text">For everyone. And for developers.</h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ac-text-secondary">
              Non-technical teammates stay in Simple mode: chat, preview, publish. Developers flip one toggle for the full IDE — same project, no migration, no lock-in.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                { icon: Boxes, t: "Progressive disclosure", d: "Nothing is hidden forever — only revealed when you want it." },
                { icon: Database, t: "Real data, real deploys", d: "Editable tables and one-click publishing, not just mockups." },
                { icon: ShieldCheck, t: "You own the output", d: "Export source or push to GitHub whenever." },
              ].map((f, i) => (
                <li key={i} className="flex gap-3">
                  <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-ac-accent" strokeWidth={1.5} />
                  <span className="text-[14px] text-ac-text-secondary"><span className="font-medium text-ac-text">{f.t}.</span> {f.d}</span>
                </li>
              ))}
            </ul>
          </div>
          <CompareToggle />
        </div>
      </section>

      {/* Framework logos */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-center text-[13px] uppercase tracking-wider text-ac-text-muted">Works with the agent frameworks you already know</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {FRAMEWORK_LOGOS.map((f) => (
            <span key={f} className="rounded-[8px] border border-ac-line bg-ac-surface px-4 py-2 font-mono text-[13px] text-ac-text-secondary">{f}</span>
          ))}
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-[28px] font-semibold tracking-[-0.02em] text-ac-text">Start from a template</h2>
          <Link to="/signup" className="text-[13px] text-ac-accent hover:underline">Browse all</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <div key={t.id} className="group rounded-[12px] border border-ac-line bg-ac-surface p-5 transition-colors hover:border-ac-line-strong">
              <div className="mb-4 h-28 rounded-[8px] border border-ac-line bg-ac-base p-3">
                <div className="h-2 w-1/3 rounded bg-ac-line" />
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  <div className="h-10 rounded bg-ac-elevated" />
                  <div className="h-10 rounded bg-ac-elevated" />
                  <div className="h-10 rounded" style={{ background: "color-mix(in srgb, var(--ac-accent) 40%, transparent)" }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-semibold text-ac-text">{t.name}</h3>
                <Badge tone="outline">{t.tag}</Badge>
              </div>
              <p className="mt-1.5 text-[13px] text-ac-text-muted">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center text-[28px] font-semibold tracking-[-0.02em] text-ac-text">Simple pricing</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {PRICING.map((p) => (
            <div key={p.name} className={`relative rounded-[14px] border bg-ac-surface p-6 ${p.tag ? "border-ac-accent" : "border-ac-line"}`}>
              {p.tag && <Badge tone="accent" className="absolute -top-3 left-6">{p.tag}</Badge>}
              <h3 className="text-[15px] font-semibold text-ac-text">{p.name}</h3>
              <p className="mt-1 text-[13px] text-ac-text-muted">{p.desc}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-[32px] font-semibold tracking-[-0.02em] text-ac-text">{p.price}</span>
                <span className="text-[13px] text-ac-text-muted">/mo</span>
              </div>
              <ul className="mt-5 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-ac-text-secondary">
                    <Check className="h-4 w-4 text-ac-accent" strokeWidth={1.5} /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="mt-6 block">
                <Button variant={p.tag ? "primary" : "secondary"} size="md" className="w-full">{p.cta}</Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="mb-8 text-center text-[28px] font-semibold tracking-[-0.02em] text-ac-text">Questions, answered</h2>
        <Faq />
      </section>

      {/* Footer */}
      <footer className="border-t border-ac-line">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 py-10 md:flex-row md:items-center">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-[13px] text-ac-text-muted">Describe it. Ship it. Own the code.</p>
          </div>
          <div className="flex items-center gap-6 text-[13px] text-ac-text-muted">
            <a href="#product" className="hover:text-ac-text">Product</a>
            <a href="#templates" className="hover:text-ac-text">Templates</a>
            <a href="#pricing" className="hover:text-ac-text">Pricing</a>
            <a href="#faq" className="hover:text-ac-text">Docs</a>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-ac-success" /> All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
