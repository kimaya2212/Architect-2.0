import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Wand2 } from "lucide-react";
import { AuthScaffold, SocialButtons } from "@/components/AuthScaffold";
import { Button } from "@/components/ds/Button";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const emailErr = touched.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? "Enter a valid email address." : "";
  const passErr = touched.password && password.length < 1 ? "Enter your password." : "";

  const submit = (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || password.length < 1) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast("Email sign-in is almost ready", { description: "For now, continue with Google to reach your workspace." });
    }, 900);
  };

  const magicLink = () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setTouched((t) => ({ ...t, email: true }));
      return;
    }
    navigate("/forgot-password", { state: { magic: true, email } });
  };

  return (
    <AuthScaffold
      title="Welcome back"
      subtitle="Sign in to keep building. Your projects are right where you left them."
      footer={<>New here? <Link to="/signup" className="font-medium text-ac-accent hover:underline" data-testid="go-signup">Create an account</Link></>}
    >
      <SocialButtons onGithub={() => toast("GitHub sign-in", { description: "Connect GitHub from Settings after you sign in with Google." })} />

      <div className="my-6 flex items-center gap-3 text-[12px] text-ac-text-muted">
        <span className="h-px flex-1 bg-ac-line" /> or <span className="h-px flex-1 bg-ac-line" />
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-ac-text-secondary">Email</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ac-text-muted" strokeWidth={1.5} />
            <input
              data-testid="login-email"
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
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-[13px] font-medium text-ac-text-secondary">Password</label>
            <Link to="/forgot-password" className="text-[12px] text-ac-text-muted hover:text-ac-text" data-testid="forgot-link">Forgot password?</Link>
          </div>
          <div className="relative">
            <input
              data-testid="login-password"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              placeholder="Your password"
              className="focus-ring h-11 w-full rounded-md border border-ac-line bg-ac-surface px-3 pr-10 text-[14px] text-ac-text placeholder:text-ac-text-muted"
            />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ac-text-muted hover:text-ac-text">
              {show ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
            </button>
          </div>
          {passErr && <p className="mt-1.5 text-[12px] text-ac-danger">{passErr}</p>}
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading} data-testid="login-submit">Sign in</Button>
      </form>

      <button onClick={magicLink} className="mt-3 inline-flex w-full items-center justify-center gap-2 text-[13px] text-ac-text-muted hover:text-ac-text" data-testid="magic-link-btn">
        <Wand2 className="h-4 w-4" strokeWidth={1.5} /> Email me a magic link instead
      </button>
    </AuthScaffold>
  );
}
