import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import api from "@/lib/api";
import { getScript, pickScript, SCRIPTS } from "@/lib/aiEngine";
import { PlanCard } from "@/components/workspace/PlanCard";
import { BuildTimeline } from "@/components/workspace/BuildTimeline";
import { Composer } from "@/components/workspace/Composer";
import { Logo } from "@/components/brand/Logo";

function scriptKeyFor(project) {
  return pickScript(project.prompt || project.description || "");
}

export function ChatPane({ project, pro, onBuildChange, elementChip, onClearChip, onOpenDiff }) {
  const script = useMemo(() => getScript(project.prompt || project.description || ""), [project]);
  const [messages, setMessages] = useState([]);        // {id, role, content, kind}
  const [status, setStatus] = useState("idle");        // idle | planning | building | done
  const [steps, setSteps] = useState([]);
  const [progress, setProgress] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [built, setBuilt] = useState(false);
  const [streamingId, setStreamingId] = useState(null);
  const [ready, setReady] = useState(false);
  const timers = useRef([]);
  const scrollRef = useRef(null);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  useEffect(() => () => clearTimers(), []);

  // report preview state upward
  useEffect(() => {
    onBuildChange?.({
      variant: script.preview,
      building: status === "building",
      status,
      progress,
      revealed: built ? 99 : revealed,
    });
  }, [status, progress, revealed, built, script.preview]); // eslint-disable-line

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, status, steps, progress]);

  // load / init
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await api.get(`/projects/${project.id}/messages`);
      if (cancelled) return;
      const msgs = res.data;
      const textMsgs = msgs.filter((m) => m.kind === "text" || m.kind === "error").map((m) => ({ id: m.id, role: m.role, content: m.content, kind: m.kind }));
      const hasBuild = msgs.some((m) => m.kind === "build");
      const hasPlan = msgs.some((m) => m.kind === "plan");

      if (msgs.length === 0 && (project.prompt || "").trim()) {
        // seed conversation
        const u = await persist({ role: "user", content: project.prompt, kind: "text" });
        const a = await persist({ role: "assistant", content: script.intro, kind: "text" });
        await persist({ role: "assistant", content: "", kind: "plan", meta: { scriptKey: scriptKeyFor(project) } });
        setMessages([u, a].map(local));
        setStatus("planning");
      } else {
        setMessages(textMsgs);
        if (hasBuild) {
          setSteps(script.steps.map((s) => ({ ...s, state: "done", elapsed: s.ms })));
          setProgress(100); setRevealed(99); setBuilt(true); setStatus("done");
        } else if (hasPlan) {
          setStatus("planning");
        } else {
          setStatus("idle");
        }
      }
      setReady(true);
    })();
    return () => { cancelled = true; };
  }, [project.id]); // eslint-disable-line

  const local = (m) => ({ id: m.id, role: m.role, content: m.content, kind: m.kind });
  const persist = async (m) => {
    try { const r = await api.post(`/projects/${project.id}/messages`, m); return r.data; }
    catch (e) { return { id: "tmp_" + Math.random(), ...m }; }
  };

  const streamMessage = (fullText) => {
    const id = "stream_" + Date.now();
    setMessages((ms) => [...ms, { id, role: "assistant", content: "", kind: "text" }]);
    setStreamingId(id);
    let i = 0;
    const tick = () => {
      i += Math.max(1, Math.round(fullText.length / 60));
      const slice = fullText.slice(0, i);
      setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, content: slice } : m)));
      if (i < fullText.length) { const t = setTimeout(tick, 24); timers.current.push(t); }
      else { setStreamingId(null); persist({ role: "assistant", content: fullText, kind: "text" }); }
    };
    const t = setTimeout(tick, 200); timers.current.push(t);
  };

  const runBuild = () => {
    setStatus("building"); setProgress(0); setRevealed(0);
    const init = script.steps.map((s) => ({ ...s, state: "pending" }));
    setSteps(init);
    let idx = 0;
    const runStep = () => {
      setSteps((st) => st.map((s, i) => (i === idx ? { ...s, state: "running" } : s)));
      const step = script.steps[idx];
      const t = setTimeout(() => {
        setSteps((st) => st.map((s, i) => (i === idx ? { ...s, state: "done", elapsed: step.ms } : s)));
        if (step.section != null) setRevealed(step.section + 1);
        setProgress(Math.round(((idx + 1) / script.steps.length) * 100));
        idx += 1;
        if (idx < script.steps.length) runStep();
        else finishBuild();
      }, step.ms);
      timers.current.push(t);
    };
    runStep();
  };

  const finishBuild = async () => {
    setRevealed(99); setProgress(100); setBuilt(true); setStatus("done");
    await persist({ role: "assistant", content: "", kind: "build", meta: { scriptKey: scriptKeyFor(project) } });
    api.patch(`/projects/${project.id}`, { status: "live" }).catch(() => {});
    const t = setTimeout(() => { streamMessage(script.done); toast("Build complete", { description: "Your app is live in the preview." }); }, 400);
    timers.current.push(t);
  };

  const approve = () => runBuild();

  const stop = () => {
    clearTimers();
    setStatus(built ? "done" : "idle");
    setSteps((st) => st.map((s) => (s.state === "running" ? { ...s, state: "pending" } : s)));
    setMessages((ms) => [...ms, { id: "stop_" + Date.now(), role: "assistant", content: "Stopped. Tell me what to change and I'll pick back up.", kind: "text" }]);
  };

  const handleSend = async (text) => {
    const withChip = elementChip ? `(Editing ${elementChip}) ${text}` : text;
    onClearChip?.();
    const u = await persist({ role: "user", content: withChip, kind: "text" });
    setMessages((ms) => [...ms, local(u)]);

    if (/^\/deploy/.test(text)) { toast("Deploy", { description: "Open the Deploy drawer from the top bar." }); return; }
    if (/^\/rollback/.test(text)) { toast("Rollback", { description: "Restore a checkpoint from the clock icon in the top bar." }); return; }

    const reply = built
      ? `Done — I applied that change and refreshed the preview. ${elementChip ? "" : "Want me to keep going?"}`.trim()
      : "Good note. I'll fold that in — approve the plan above and I'll start building.";
    const t = setTimeout(() => streamMessage(reply), 300);
    timers.current.push(t);
  };

  const suggestions = script.suggestions;

  return (
    <div className="flex h-full flex-col bg-ac-base">
      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-4">
        {!ready ? (
          <div className="space-y-4">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-16 rounded-[10px]" />)}</div>
        ) : (
          <>
            {messages.map((m) => (
              <div key={m.id} className={m.role === "user" ? "flex justify-end" : ""} data-testid={`msg-${m.role}`}>
                {m.role === "user" ? (
                  <div className="max-w-[85%] whitespace-pre-wrap rounded-[12px] rounded-tr-[4px] bg-ac-elevated px-3.5 py-2.5 text-[14px] text-ac-text">{m.content}</div>
                ) : (
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] border border-ac-line bg-ac-surface"><Logo showWord={false} size={14} /></div>
                    <div className="min-w-0 flex-1 whitespace-pre-wrap text-[14px] leading-relaxed text-ac-text-secondary">
                      {m.content}
                      {streamingId === m.id && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-caret-blink bg-ac-accent" />}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {status === "planning" && (
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] border border-ac-line bg-ac-surface"><Sparkles className="h-3.5 w-3.5 text-ac-accent" /></div>
                <div className="min-w-0 flex-1"><PlanCard plan={script.plan} approved={false} onApprove={approve} onEdit={() => toast("Edit in chat", { description: "Type your changes below and I'll update the plan." })} /></div>
              </div>
            )}

            {(status === "building" || status === "done") && steps.length > 0 && (
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] border border-ac-line bg-ac-surface"><Sparkles className="h-3.5 w-3.5 text-ac-accent" /></div>
                <div className="min-w-0 flex-1">
                  <BuildTimeline steps={steps} filesChanged={script.filesChanged} completed={status === "done"} pro={pro} onOpenDiff={onOpenDiff} />
                </div>
              </div>
            )}

            {(built || status === "idle") && suggestions?.length > 0 && (
              <div className="flex flex-wrap gap-2 pl-10">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => handleSend(s)} className="rounded-full border border-ac-line bg-ac-surface px-3 py-1.5 text-[12px] text-ac-text-secondary transition-colors hover:border-ac-line-strong hover:text-ac-text" data-testid={`suggestion-chip-${s.slice(0, 6)}`}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Composer onSend={handleSend} building={status === "building"} onStop={stop} elementChip={elementChip} onClearChip={onClearChip} pro={pro} />
    </div>
  );
}
