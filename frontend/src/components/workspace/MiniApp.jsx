import React from "react";
import { LineChart, Line, ResponsiveContainer, BarChart, Bar, Tooltip, XAxis } from "recharts";
import { Search, Plus, Send } from "lucide-react";

const rev = [
  { m: "Jan", v: 22 }, { m: "Feb", v: 30 }, { m: "Mar", v: 28 }, { m: "Apr", v: 41 },
  { m: "May", v: 38 }, { m: "Jun", v: 52 }, { m: "Jul", v: 48 }, { m: "Aug", v: 61 },
];
const CUSTOMERS = [
  ["Acme Inc", "Pro", "$1,200", "Active"], ["Globex", "Team", "$3,400", "Active"],
  ["Initech", "Free", "$0", "Trial"], ["Umbrella", "Pro", "$1,200", "Past due"],
  ["Soylent", "Team", "$3,400", "Active"],
];

function Sk({ h = 60, className = "" }) { return <div className={`skeleton rounded-[8px] ${className}`} style={{ height: h }} />; }

function Section({ done, children, sk }) {
  if (!done) return sk;
  return <div className="animate-fade-in">{children}</div>;
}

export function MiniApp({ variant = "saas", revealed = 99, route = "/" }) {
  if (variant === "landing") {
    return (
      <div className="min-h-full bg-white text-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-3">
          <span className="text-[14px] font-semibold">Lumen</span>
          <span className="flex gap-4 text-[12px] text-zinc-500"><span>Features</span><span>Pricing</span><span>Docs</span></span>
        </div>
        <div className="px-6 py-10">
          <Section done={revealed >= 1} sk={<div className="space-y-3"><Sk h={32} className="w-2/3" /><Sk h={16} className="w-1/2" /><Sk h={40} className="w-40" /></div>}>
            <h1 className="text-[28px] font-semibold tracking-tight text-zinc-900">Write less. Ship more.</h1>
            <p className="mt-2 max-w-md text-[14px] text-zinc-500">The notes app that turns your ideas into action. Fast, private, delightful.</p>
            <button className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-[13px] font-medium text-white">Get started free</button>
          </Section>
          <Section done={revealed >= 2} sk={<div className="mt-10 grid grid-cols-3 gap-3"><Sk /><Sk /><Sk /></div>}>
            <div className="mt-10 grid grid-cols-3 gap-3">
              {["Capture", "Organize", "Recall"].map((f) => (
                <div key={f} className="rounded-xl border border-zinc-200 p-4">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100" />
                  <div className="mt-3 text-[14px] font-medium">{f}</div>
                  <div className="mt-1 text-[12px] text-zinc-500">A short benefit line explaining {f.toLowerCase()}.</div>
                </div>
              ))}
            </div>
          </Section>
          <Section done={revealed >= 3} sk={<div className="mt-8"><Sk h={80} /></div>}>
            <div className="mt-8 rounded-xl border border-zinc-200 p-5">
              <div className="text-[14px] font-medium">Frequently asked</div>
              <div className="mt-2 text-[13px] text-zinc-500">Is it free? · Can I export? · Do you have an API?</div>
            </div>
          </Section>
        </div>
      </div>
    );
  }

  if (variant === "support") {
    return (
      <div className="grid min-h-full grid-cols-3 bg-white text-zinc-900">
        <div className="col-span-2 flex flex-col border-r border-zinc-200">
          <div className="border-b border-zinc-200 px-5 py-3 text-[14px] font-semibold">Support</div>
          <div className="flex-1 space-y-3 p-5">
            <Section done={revealed >= 1} sk={<Sk h={40} />}>
              <div className="w-fit rounded-2xl rounded-tl-sm bg-zinc-100 px-3 py-2 text-[13px]">Hi! How can I help with your account today?</div>
            </Section>
            <Section done={revealed >= 2} sk={<Sk h={40} className="ml-auto w-2/3" />}>
              <div className="ml-auto w-fit rounded-2xl rounded-tr-sm bg-emerald-600 px-3 py-2 text-[13px] text-white">I can't reset my password.</div>
            </Section>
            <Section done={revealed >= 2} sk={<div />}>
              <div className="w-fit max-w-[80%] rounded-2xl rounded-tl-sm bg-zinc-100 px-3 py-2 text-[13px]">No problem — use “Forgot password” on the sign-in page. I can send the link now if you'd like.</div>
            </Section>
          </div>
          <div className="flex items-center gap-2 border-t border-zinc-200 p-3">
            <div className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-[13px] text-zinc-400">Type a message…</div>
            <button className="rounded-lg bg-emerald-600 p-2 text-white"><Send className="h-4 w-4" /></button>
          </div>
        </div>
        <Section done={revealed >= 3} sk={<div className="p-4"><Sk h={200} /></div>}>
          <div className="p-4">
            <div className="text-[12px] font-medium text-zinc-500">Sources</div>
            {["Resetting your password", "Account security", "Login issues"].map((s) => (
              <div key={s} className="mt-2 rounded-lg border border-zinc-200 p-2 text-[12px] text-zinc-700">{s}</div>
            ))}
          </div>
        </Section>
      </div>
    );
  }

  // saas (default)
  const settings = route === "/settings";
  return (
    <div className="min-h-full bg-white text-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
        <span className="text-[14px] font-semibold">{settings ? "Settings" : "Dashboard"}</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2 py-1 text-[12px] text-zinc-400"><Search className="h-3.5 w-3.5" /> Search</div>
          <div className="h-6 w-6 rounded-full bg-zinc-200" />
        </div>
      </div>
      <div className="p-5">
        {settings ? (
          <div className="max-w-md space-y-3">
            <div className="text-[13px] font-medium">Workspace name</div>
            <div className="rounded-lg border border-zinc-200 px-3 py-2 text-[13px]">Northwind</div>
            <div className="text-[13px] font-medium">Billing email</div>
            <div className="rounded-lg border border-zinc-200 px-3 py-2 text-[13px] text-zinc-500">billing@northwind.co</div>
            <button className="rounded-lg bg-emerald-600 px-4 py-2 text-[13px] font-medium text-white">Save changes</button>
          </div>
        ) : (
          <>
            <Section done={revealed >= 1} sk={<div className="grid grid-cols-3 gap-3"><Sk /><Sk /><Sk /></div>}>
              <div className="grid grid-cols-3 gap-3">
                {[["MRR", "$48.2k", "+18%"], ["Customers", "1,284", "+4%"], ["Churn", "1.9%", "-0.3%"]].map(([l, v, d]) => (
                  <div key={l} className="rounded-xl border border-zinc-200 p-4">
                    <div className="text-[11px] text-zinc-500">{l}</div>
                    <div className="mt-1 text-[20px] font-semibold">{v}</div>
                    <div className="text-[11px] text-emerald-600">{d}</div>
                  </div>
                ))}
              </div>
            </Section>
            <Section done={revealed >= 2} sk={<div className="mt-4"><Sk h={140} /></div>}>
              <div className="mt-4 rounded-xl border border-zinc-200 p-4">
                <div className="mb-2 text-[13px] font-medium">Revenue</div>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={rev}>
                      <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                      <Line type="monotone" dataKey="v" stroke="#059669" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Section>
            <Section done={revealed >= 3} sk={<div className="mt-4"><Sk h={160} /></div>}>
              <div className="mt-4 rounded-xl border border-zinc-200">
                <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2.5">
                  <span className="text-[13px] font-medium">Customers</span>
                  <button className="flex items-center gap-1 rounded-md bg-zinc-100 px-2 py-1 text-[11px]"><Plus className="h-3 w-3" /> Add</button>
                </div>
                <table className="w-full text-[12px]">
                  <thead className="text-zinc-400"><tr>{["Name", "Plan", "MRR", "Status"].map((h) => <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>)}</tr></thead>
                  <tbody>
                    {CUSTOMERS.map((r, i) => (
                      <tr key={i} className="border-t border-zinc-100">
                        {r.map((c, j) => <td key={j} className={`px-4 py-2 ${j === 0 ? "font-medium" : "text-zinc-600"}`}>{j === 3 ? <span className={`rounded-full px-2 py-0.5 text-[11px] ${c === "Active" ? "bg-emerald-100 text-emerald-700" : c === "Trial" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{c}</span> : c}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
