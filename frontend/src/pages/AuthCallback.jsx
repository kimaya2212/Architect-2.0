import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/brand/Logo";

export default function AuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = location.hash || window.location.hash;
    const match = hash.match(/session_id=([^&]+)/);
    const sessionId = match ? decodeURIComponent(match[1]) : null;

    if (!sessionId) {
      navigate("/login", { replace: true });
      return;
    }

    (async () => {
      try {
        const res = await api.post("/auth/session", null, { headers: { "X-Session-ID": sessionId } });
        setUser(res.data);
        window.history.replaceState(null, "", window.location.pathname);
        const dest = res.data.onboarding_completed ? "/home" : "/onboarding";
        navigate(dest, { replace: true, state: { user: res.data } });
      } catch (e) {
        setError(true);
        setTimeout(() => navigate("/login", { replace: true }), 1800);
      }
    })();
  }, [location.hash, navigate, setUser]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ac-base">
      <div className="flex flex-col items-center gap-4">
        <Logo showWord={false} size={28} />
        <p className="text-[14px] text-ac-text-muted">
          {error ? "That sign-in didn't complete. Taking you back to login." : "Signing you in…"}
        </p>
      </div>
    </div>
  );
}
