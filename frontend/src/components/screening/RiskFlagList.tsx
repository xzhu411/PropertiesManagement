"use client";

import { useState } from "react";
import { RiskFlag } from "@/lib/types";
import { ChevronDown, ChevronRight } from "lucide-react";

const severityConfig = {
  HIGH:   { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  MEDIUM: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  LOW:    { color: "text-slate-400", bg: "bg-[#1a1e2a]", border: "border-white/[0.07]" },
};

export default function RiskFlagList({ flags }: { flags: RiskFlag[] }) {
  const [open, setOpen] = useState<Set<number>>(new Set([0]));

  const toggle = (i: number) =>
    setOpen(prev => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; });

  if (flags.length === 0) {
    return (
      <div className="bg-[#13161f] border border-white/[0.07] rounded-xl p-5">
        <p className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">Risk Flags</p>
        <p className="text-xs text-[#84cc16]">✓ No significant risk flags identified</p>
      </div>
    );
  }

  return (
    <div className="bg-[#13161f] border border-white/[0.07] rounded-xl p-4">
      <p className="text-[13px] text-slate-500 uppercase tracking-wider mb-3">
        Risk Flags <span className="text-slate-700">({flags.length})</span>
      </p>
      <div className="space-y-2">
        {flags.map((flag, i) => {
          const cfg = severityConfig[flag.severity];
          const isOpen = open.has(i);
          return (
            <div key={i} className={`rounded border ${cfg.border} ${cfg.bg}`}>
              <button
                className="w-full flex items-start gap-2 p-3 text-left"
                onClick={() => toggle(i)}
              >
                <span className={`text-xs font-bold ${cfg.color} shrink-0 mt-0.5`}>
                  {flag.severity}
                </span>
                <span className="text-sm text-slate-300 flex-1">{flag.flag}</span>
                <span className="text-slate-600 shrink-0">
                  {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </span>
              </button>
              {isOpen && (
                <div className="px-3 pb-3 space-y-2 text-sm">
                  <p className="text-slate-400">{flag.detail}</p>
                  {flag.mitigant && (
                    <p className="text-[#84cc16] opacity-80">
                      <span className="text-slate-500">Mitigant: </span>
                      {flag.mitigant}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
