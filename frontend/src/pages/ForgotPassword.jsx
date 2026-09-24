import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail, ArrowLeft, MailCheck } from "lucide-react";
import { AuthScaffold } from "@/components/AuthScaffold";
import { Button } from "@/components/ds/Button";

export default function ForgotPassword() {
  const location = useLocation();
  const magic = location.state?.magic;
  const [email, setEmail] = useState(location.state?.email || "");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 900);
  };

  if (sent) {
    return (
      <AuthScaffold title="Check your inbox" subtitle={`We sent a ${magic ? "sign-in" : "reset"} link to ${email}. It expires in 15 minutes.`}>
        <div className="rounded-[10px] border border-ac-line bg-ac-elevated p-5 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--ac-accent)_16%,transparent)]">
            <MailCheck className="h-5 w-5 text-ac-accent" strokeWidth={1.5} />
          </div>
          <p className="text-[14px] text-ac-text-secondary">Didn't get it? Check spam, or resend in a moment.</p>
          <Button variant="secondary" size="md" className="mt-4 w-full" onClick={() => setSent(false)} data-testid="resend-btn">Use a different email</Button>
        </div>
        <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-[13px] text-ac-text-muted hover:text-ac-text" data-testid="back-to-login">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Back to sign in
        </Link>
      </AuthScaffold>
    );
  }

  return (
    <AuthScaffold
      title={magic ? "Sign in with a link" : "Reset your password"}
      subtitle={magic ? "Enter your email and we'll send a one-tap sign-in link." : "Enter your email and we'll send a link to set a new password."}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-ac-text-secondary">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ac-text-muted" strokeWidth={1.5} />
            <input
              data-testid="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="focus-ring h-11 w-full rounded-md border border-ac-line bg-ac-surface pl-9 pr-3 text-[14px] text-ac-text placeholder:text-ac-text-muted"
            />
          </div>
        </div>
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading} disabled={!valid} data-testid="forgot-submit">
          {magic ? "Send magic link" : "Send reset link"}
        </Button>
      </form>
      <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-[13px] text-ac-text-muted hover:text-ac-text" data-testid="back-to-login">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Back to sign in
      </Link>
    </AuthScaffold>
  );
}
