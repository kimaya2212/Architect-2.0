import React, { useState } from "react";
import { MOCK_FILES, MOCK_CODE } from "@/lib/aiEngine";
import { FileCode2, Folder, Search } from "lucide-react";

const GIT_COLOR = { M: "text-ac-warning", A: "text-ac-success", D: "text-ac-danger" };

function highlight(code) {
  // extremely light token coloring for demo purposes
  return code.split("\n").map((line, i) => {
    const html = line
      .replace(/(".*?")/g, '<span style="color:var(--ac-success)">$1</span>')
      .replace(/\b(export|default|function|return|const|import|from|async|await)\b/g, '<span style="color:var(--ac-info)">$1</span>')
      .replace(/(\/\/.*)/g, '<span style="color:var(--ac-text-muted)">$1</span>');
    return (
      <div key={i} className="flex">
        <span className="w-10 shrink-0 select-none pr-3 text-right text-ac-text-muted">{i + 1}</span>
        <span dangerouslySetInnerHTML={{ __html: html || "&nbsp;" }} />
      </div>
    );
  });
}

export function CodeTab() {
  const [active, setActive] = useState(MOCK_FILES[0].path);
  const [openTabs, setOpenTabs] = useState([MOCK_FILES[0].path]);

  const open = (path) => {
    setActive(path);
    setOpenTabs((t) => (t.includes(path) ? t : [...t, path]));
  };

  return (
    <div className="flex h-full bg-ac-base">
      {/* file tree */}
      <div className="w-56 shrink-0 border-r border-ac-line bg-ac-surface">
        <div className="flex items-center gap-2 border-b border-ac-line px-3 py-2 text-[12px] text-ac-text-muted">
          <Search className="h-3.5 w-3.5" /> Search files
        </div>
        <div className="p-2">
          <div className="flex items-center gap-1.5 px-1 py-1 text-[12px] text-ac-text-secondary"><Folder className="h-3.5 w-3.5" /> app</div>
          {MOCK_FILES.map((f) => (
            <button key={f.path} onClick={() => open(f.path)} className={`flex w-full items-center gap-2 rounded-[6px] px-2 py-1 text-left text-[12px] ${active === f.path ? "bg-ac-elevated text-ac-text" : "text-ac-text-secondary hover:bg-ac-elevated"}`} data-testid={`file-${f.path}`}>
              <FileCode2 className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
              <span className="truncate">{f.path.split("/").pop()}</span>
              <span className={`ml-auto font-mono text-[10px] ${GIT_COLOR[f.git]}`}>{f.git}</span>
            </button>
          ))}
        </div>
      </div>

      {/* editor */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-1 border-b border-ac-line bg-ac-surface px-2">
          {openTabs.map((t) => (
            <button key={t} onClick={() => setActive(t)} className={`border-b-2 px-3 py-2 text-[12px] ${active === t ? "border-ac-accent text-ac-text" : "border-transparent text-ac-text-muted hover:text-ac-text-secondary"}`}>
              {t.split("/").pop()}
            </button>
          ))}
        </div>
        <div className="border-b border-ac-line px-3 py-1.5 font-mono text-[11px] text-ac-text-muted">{active}</div>
        <div className="flex-1 overflow-auto p-3 font-mono text-[12px] leading-[1.7] text-ac-text">
          {highlight(MOCK_CODE[active] || "// empty")}
        </div>
      </div>
    </div>
  );
}
