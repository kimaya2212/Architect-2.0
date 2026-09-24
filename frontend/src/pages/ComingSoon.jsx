import React from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Plug, CreditCard, Sparkles, ArrowLeft } from "lucide-react";
import { EmptyState } from "@/components/ds/EmptyState";
import { Button } from "@/components/ds/Button";
import { Badge } from "@/components/ds/Badge";

const CONFIG = {
  Agents: { icon: Bot, desc: "Design, test and deploy AI agents with visual blueprints, playground traces and evals." },
  Integrations: { icon: Plug, desc: "Connect Stripe, Resend, Supabase, OpenAI and more with one-click setup." },
  "Usage & Billing": { icon: CreditCard, desc: "Track credits, review usage by project and manage your plan." },
};

export default function ComingSoon({ page }) {
  const navigate = useNavigate();
  const c = CONFIG[page] || { icon: Sparkles, desc: "This section is on the way." };
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-2 flex items-center gap-2">
        <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-ac-text">{page}</h1>
        <Badge tone="outline">Next phase</Badge>
      </div>
      <div className="mt-8 rounded-[14px] border border-dashed border-ac-line bg-ac-surface">
        <EmptyState
          icon={c.icon}
          title={`${page} is coming next`}
          description={c.desc}
          action={<Button variant="secondary" size="md" onClick={() => navigate("/home")}><ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Back to Home</Button>}
        />
      </div>
    </div>
  );
}
