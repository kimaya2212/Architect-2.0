import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as Icons from "lucide-react";
import { ArrowRight, ArrowLeft, Check, Github, Cloud, KeyRound } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ds/Button";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { ONBOARD_GOALS, ONBOARD_WORKSTYLES } from "@/lib/mockData";

const Icon = ({ name, ...p }) => {
  const C = Icons[name] || Icons.Square;
  return <C {...p} />;
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { setUser, updatePrefs } = useAuth();
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState([]);
  const [work, setWork] = useState(null);
  const [connected, setConnected] = useState({});
  const [saving, setSaving] = useState(false);

  const toggleGoal = (k) => setGoals((g) => (g.includes(k) ? g.filter((x) => x !== k) : [...g, k]));
  const mode = ONBOARD_WORKSTYLES.find((w) => w.key === work)?.mode || "simple";

  const finish = async (skipped = false) => {
    setSaving(true);
    try {
      const res = await api.post("/users/me/onboarding", {
        goals: skipped ? [] : goals,
        work_style: work || "no_code",
        connected,
        mode,
      });
      setUser(res.data);
      navigate("/home", { replace: true });
    } catch (e) {
      toast("Couldn't save preferences", { description: "Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const next = () => {
    if (step < 2) setStep(step + 1);
    else finish();
  };
  const canNext = step === 0 ? goals.length > 0 : step === 1 ? !!work : true;

  return (
    <div className="min-h-screen bg-ac-base">
      <header className="flex items-center justify-between border-b border-ac-line px-6 py-4">
        <Logo />
        <button onClick={() => finish(true)} className="text-[13px] text-ac-text-muted hover:text-ac-text" data-testid="onboarding-skip">Skip for now</button>
      </header>

      <div className="mx-auto max-w-2xl px-5 py-12">
        {/* progress dots */}
        <div className="mb-10 flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-8 bg-ac-accent" : i < step ? "w-4 bg-ac-accent/50" : "w-4 bg-ac-line"}`} />
          ))}
        </div>

        {step === 0 && (
          <div className="animate-fade-up">
            <h1 className="text-center text-[28px] font-semibold tracking-[-0.02em] text-ac-text">What brings you here?</h1>
            <p className="mt-2 text-center text-[14px] text-ac-text-muted">Pick anything that fits. You can change this later.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {ONBOARD_GOALS.map((g) => {
                const on = goals.includes(g.key);
                return (
                  <button
                    key={g.key}
                    onClick={() => toggleGoal(g.key)}
                    data-testid={`goal-${g.key}`}
                    className={`relative rounded-[12px] border p-5 text-left transition-all duration-150 ${on ? "border-ac-accent bg-[color-mix(in_srgb,var(--ac-accent)_8%,transparent)]" : "border-ac-line bg-ac-surface hover:border-ac-line-strong"}`}
                  >
                    {on && <Check className="absolute right-4 top-4 h-4 w-4 text-ac-accent" strokeWidth={2} />}
                    <Icon name={g.icon} className="mb-3 h-5 w-5 text-ac-accent" strokeWidth={1.5} />
                    <div className="text-[15px] font-semibold text-ac-text">{g.title}</div>
                    <div className="mt-1 text-[13px] text-ac-text-muted">{g.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-up">
            <h1 className="text-center text-[28px] font-semibold tracking-[-0.02em] text-ac-text">How do you work?</h1>
            <p className="mt-2 text-center text-[14px] text-ac-text-muted">This sets your default. Flip between Simple and Pro any time.</p>
            <div className="mt-8 space-y-3">
              {ONBOARD_WORKSTYLES.map((w) => {
                const on = work === w.key;
                return (
                  <button
                    key={w.key}
                    onClick={() => setWork(w.key)}
                    data-testid={`work-${w.key}`}
                    className={`flex w-full items-center gap-4 rounded-[12px] border p-5 text-left transition-all duration-150 ${on ? "border-ac-accent bg-[color-mix(in_srgb,var(--ac-accent)_8%,transparent)]" : "border-ac-line bg-ac-surface hover:border-ac-line-strong"}`}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-ac-line bg-ac-elevated">
                      <Icon name={w.icon} className="h-5 w-5 text-ac-accent" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <div className="text-[15px] font-semibold text-ac-text">{w.title}</div>
                      <div className="mt-0.5 text-[13px] text-ac-text-muted">{w.desc}</div>
                    </div>
                    <span className={`rounded-[6px] px-2 py-1 text-[11px] font-medium ${w.mode === "pro" ? "bg-ac-elevated text-ac-text-secondary" : "bg-[color-mix(in_srgb,var(--ac-accent)_16%,transparent)] text-ac-accent"}`}>
                      {w.mode === "pro" ? "Pro mode" : "Simple mode"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-up">
            <h1 className="text-center text-[28px] font-semibold tracking-[-0.02em] text-ac-text">Connect your tools</h1>
            <p className="mt-2 text-center text-[14px] text-ac-text-muted">Optional. You can do any of this later from Settings.</p>
            <div className="mt-8 space-y-3">
              {[
                { key: "github", label: "GitHub", desc: "Sync code to your own repos", icon: Github },
                { key: "deploy", label: "Deploy target", desc: "Architect Cloud is ready by default", icon: Cloud },
                { key: "model", label: "Model provider key", desc: "Bring your own OpenAI, Anthropic or Gemini key", icon: KeyRound },
              ].map((c) => {
                const on = connected[c.key];
                return (
                  <div key={c.key} className="flex items-center gap-4 rounded-[12px] border border-ac-line bg-ac-surface p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-ac-line bg-ac-elevated">
                      <c.icon className="h-5 w-5 text-ac-text-secondary" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <div className="text-[14px] font-medium text-ac-text">{c.label}</div>
                      <div className="text-[13px] text-ac-text-muted">{c.desc}</div>
                    </div>
                    <Button
                      variant={on ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => { setConnected((p) => ({ ...p, [c.key]: !on })); if (!on) toast(`${c.label} connected`, { description: "You can manage this in Settings." }); }}
                      data-testid={`connect-${c.key}`}
                    >
                      {on ? <><Check className="h-4 w-4" strokeWidth={2} /> Connected</> : "Connect"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-10 flex items-center justify-between">
          <Button variant="ghost" size="md" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} data-testid="onboarding-back">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Back
          </Button>
          <Button variant="primary" size="md" onClick={next} disabled={!canNext} loading={saving} data-testid="onboarding-next">
            {step === 2 ? "Finish" : "Continue"} <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </div>
      </div>
    </div>
  );
}
