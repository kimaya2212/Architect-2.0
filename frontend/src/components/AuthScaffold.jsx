import React from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/brand/Logo";
import { Quote } from "lucide-react";

const GoogleIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
  </svg>
);

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...props}>
    <path d="M12 1.5A10.5 10.5 0 0 0 8.68 22c.53.1.72-.23.72-.5v-1.9c-2.93.64-3.55-1.26-3.55-1.26-.48-1.22-1.17-1.55-1.17-1.55-.96-.65.07-.64.07-.64 1.06.08 1.62 1.09 1.62 1.09.94 1.62 2.47 1.15 3.07.88.1-.68.37-1.15.67-1.42-2.34-.27-4.8-1.17-4.8-5.2 0-1.15.41-2.09 1.08-2.83-.11-.27-.47-1.34.1-2.79 0 0 .88-.28 2.88 1.08a10 10 0 0 1 5.24 0c2-1.36 2.88-1.08 2.88-1.08.57 1.45.21 2.52.1 2.79.67.74 1.08 1.68 1.08 2.83 0 4.04-2.47 4.93-4.82 5.19.38.33.72.98.72 1.98v2.93c0 .28.19.61.73.5A10.5 10.5 0 0 0 12 1.5z" />
  </svg>
);

export function SocialButtons({ onGithub }) {
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const handleGoogle = () => {
    const redirectUrl = window.location.origin + "/home";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      <button
        onClick={handleGoogle}
        data-testid="continue-google-btn"
        className="focus-ring inline-flex h-11 items-center justify-center gap-2.5 rounded-md border border-ac-line-strong bg-ac-surface text-[14px] font-medium text-ac-text transition-colors hover:bg-ac-elevated"
      >
        <GoogleIcon /> Continue with Google
      </button>
      <button
        onClick={onGithub}
        data-testid="continue-github-btn"
        className="focus-ring inline-flex h-11 items-center justify-center gap-2.5 rounded-md border border-ac-line-strong bg-ac-surface text-[14px] font-medium text-ac-text transition-colors hover:bg-ac-elevated"
      >
        <GithubIcon /> Continue with GitHub
      </button>
    </div>
  );
}

const QUOTES = [
  { line: "I described a dashboard over coffee and shipped it before lunch.", by: "Maya · Product lead" },
  { line: "The trace view alone replaced three tools for our agent team.", by: "Devang · Staff engineer" },
  { line: "Simple mode for my team, Pro mode for me. Same project.", by: "Lena · Founder" },
];

export function AuthScaffold({ title, subtitle, children, footer }) {
  const [qi, setQi] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setQi((q) => (q + 1) % QUOTES.length), 4500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="grid min-h-screen bg-ac-base lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex flex-col px-6 py-8 sm:px-10 lg:px-16">
        <Link to="/" className="inline-flex w-fit" data-testid="auth-logo-home">
          <Logo />
        </Link>
        <div className="flex flex-1 flex-col justify-center py-10">
          <div className="mx-auto w-full max-w-sm animate-fade-up">
            <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-ac-text">{title}</h1>
            <p className="mt-2 text-[14px] text-ac-text-muted">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-6 text-center text-[13px] text-ac-text-muted">{footer}</div>}
          </div>
        </div>
        <p className="text-center text-[12px] text-ac-text-muted lg:text-left">
          By continuing you agree to the Terms and Privacy Policy.
        </p>
      </div>

      {/* Right: visual */}
      <div className="relative hidden overflow-hidden border-l border-ac-line bg-ac-surface lg:block">
        <div className="absolute inset-0 bg-grid opacity-[0.35]" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(90% 60% at 70% 10%, color-mix(in srgb, var(--ac-accent) 12%, transparent), transparent 60%)" }} />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="mt-6 rounded-[14px] border border-ac-line bg-ac-base p-4 shadow-float">
            <div className="flex items-center gap-2 border-b border-ac-line pb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-ac-danger/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-ac-warning/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-ac-success/60" />
              <span className="ml-2 font-mono text-[12px] text-ac-text-muted">architect · preview</span>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-4">
              <div className="col-span-2 space-y-2">
                <div className="h-2 w-1/3 rounded bg-ac-line-strong" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-[8px] border border-ac-line bg-ac-surface p-3">
                    <div className="h-1.5 w-10 rounded bg-ac-line" />
                    <div className="mt-2 h-4 w-16 rounded bg-ac-accent" />
                  </div>
                  <div className="rounded-[8px] border border-ac-line bg-ac-surface p-3">
                    <div className="h-1.5 w-10 rounded bg-ac-line" />
                    <div className="mt-2 h-4 w-12 rounded bg-ac-info/70" />
                  </div>
                </div>
                <div className="flex items-end gap-1.5 rounded-[8px] border border-ac-line bg-ac-surface p-3">
                  {[50, 70, 45, 85, 60, 95, 72, 66].map((h, i) => (
                    <span key={i} className="flex-1 rounded-[2px] bg-ac-accent/80" style={{ height: h }} />
                  ))}
                </div>
              </div>
              <div className="space-y-2 rounded-[8px] border border-ac-line bg-ac-surface p-3">
                <div className="h-1.5 w-full rounded bg-ac-line" />
                <div className="h-1.5 w-3/4 rounded bg-ac-line" />
                <div className="h-1.5 w-2/3 rounded bg-ac-line" />
                <div className="h-6 w-full rounded-[6px] bg-ac-elevated" />
                <div className="h-6 w-full rounded-[6px] bg-ac-elevated" />
              </div>
            </div>
          </div>
          <div className="max-w-md">
            <Quote className="mb-3 h-6 w-6 text-ac-accent" strokeWidth={1.5} />
            <p key={qi} className="animate-fade-in text-[20px] font-medium leading-snug tracking-[-0.01em] text-ac-text">
              {QUOTES[qi].line}
            </p>
            <p className="mt-3 text-[13px] text-ac-text-muted">{QUOTES[qi].by}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
