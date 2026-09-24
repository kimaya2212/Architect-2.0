import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, User } from "lucide-react";
import { AuthScaffold, SocialButtons } from "@/components/AuthScaffold";
import { Button } from "@/components/ds/Button";

function strength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0..4
}

const LABELS = ["Too short", "Weak", "Fair", "Good", "Strong"];
const COLORS = ["bg-ac-danger", "bg-ac-danger", "bg-ac-warning", "bg-ac-info", "bg-ac-success"];

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const sc = useMemo(() => strength(password), [password]);
  const emailErr = touched.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? "Enter a valid email address." : "";

  const submit = (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || sc < 2) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast("Almost there", { description: "Email signup is coming soon. Continue with Google to start building now." });
    }, 900);
  };

  return (
    <AuthScaffold
      title="Start building"
      subtitle="Describe an app or agent in plain language. Own the code from day one."
      footer={<>Already have an account? <Link to="/login" className="font-medium text-ac-accent hover:underline" data-testid="go-login">Sign in</Link></>}
    >
      <SocialButtons onGithub={() => toast("GitHub sign-in", { description: "Connect GitHub from Settings after you sign in with Google." })} />

      <div className="my-6 flex items-center gap-3 text-[12px] text-ac-text-muted">
        <span className="h-px flex-1 bg-ac-line" /> or <span className="h-px flex-1 bg-ac-line" />
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-ac-text-secondary">Full name</label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ac-text-muted" strokeWidth={1.5} />
            <input
              data-testid="signup-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              placeholder="Ada Lovelace"
              className="focus-ring h-11 w-full rounded-md border border-ac-line bg-ac-surface pl-9 pr-3 text-[14px] text-ac-text placeholder:text-ac-text-muted"
            />
          </div>
          {touched.name && !name && <p className="mt-1.5 text-[12px] text-ac-danger">Tell us what to call you.</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-ac-text-secondary">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ac-text-muted" strokeWidth={1.5} />
            <input
              data-testid="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              placeholder="you@company.com"
              className="focus-ring h-11 w-full rounded-md border border-ac-line bg-ac-surface pl-9 pr-3 text-[14px] text-ac-text placeholder:text-ac-text-muted"
            />
          </div>
          {emailErr && <p className="mt-1.5 text-[12px] text-ac-danger">{emailErr}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-ac-text-secondary">Password</label>
          <div className="relative">
            <input
              data-testid="signup-password"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              placeholder="At least 8 characters"
              className="focus-ring h-11 w-full rounded-md border border-ac-line bg-ac-surface px-3 pr-10 text-[14px] text-ac-text placeholder:text-ac-text-muted"
            />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ac-text-muted hover:text-ac-text">
              {show ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
            </button>
          </div>
          {password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < sc ? COLORS[sc] : "bg-ac-line"}`} />
                ))}
              </div>
              <p className="mt-1.5 text-[12px] text-ac-text-muted">{LABELS[sc]}</p>
            </div>
          )}
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading} data-testid="signup-submit">Create account</Button>
      </form>
    </AuthScaffold>
  );
}
