"use client";

import { useState } from "react";
import { RiskAlert } from "@/lib/types";
import { AlertTriangle, Eye, Info, ChevronDown, ChevronUp, ExternalLink, FileText } from "lucide-react";
import DraftNoticeModal from "./DraftNoticeModal";

const levelConfig = {
  URGENT: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", borderExpanded: "border-red-500/40", prefix: "[URGENT]" },
  WATCH:  { icon: Eye,           color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", borderExpanded: "border-amber-500/40", prefix: "[WATCH]" },
  INFO:   { icon: Info,          color: "text-slate-400", bg: "bg-[#1a1e2a]", border: "border-white/[0.07]", borderExpanded: "border-white/[0.12]", prefix: "[INFO]" },
};

export default function AIRiskFeed({ alerts }: { alerts: RiskAlert[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [draftAlert, setDraftAlert] = useState<RiskAlert | null>(null);

  return (
    <div className="bg-[#13161f] border border-white/[0.07] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-[#84cc16] animate-pulse" />
        <h3 className="text-sm font-medium text-slate-100">AI Risk Feed</h3>
        <span className="text-[10px] text-slate-600 ml-auto">Live monitoring</span>
      </div>
      <div className="space-y-2 font-mono text-xs">
        {alerts.map((alert, i) => {
          const cfg = levelConfig[alert.level];
          const Icon = cfg.icon;
          const isOpen = expanded === i;
          const hasDetail = !!alert.analysis;

          return (
            <div
              key={i}
              className={`${cfg.bg} border ${isOpen ? cfg.borderExpanded : cfg.border} rounded transition-colors`}
            >
              <button
                className={`w-full text-left p-3 flex gap-3 ${hasDetail ? "cursor-pointer" : "cursor-default"}`}
                onClick={() => hasDetail && setExpanded(isOpen ? null : i)}
              >
                <Icon size={12} className={`${cfg.color} mt-0.5 shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className={`${cfg.color} text-[10px] font-bold shrink-0`}>{cfg.prefix}</span>
                    <span className="text-slate-400 text-[10px] shrink-0">{alert.property}{alert.unit ? ` · Unit ${alert.unit}` : ""}</span>
                  </div>
                  <p className="text-slate-300 mt-0.5 leading-relaxed text-left">{alert.message}</p>
                  <p className={`mt-1 text-[10px] ${cfg.color} opacity-70`}>→ {alert.action}</p>
                </div>
                {hasDetail && (
                  <div className={`${cfg.color} opacity-50 mt-0.5 shrink-0`}>
                    {isOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </div>
                )}
              </button>

              {isOpen && alert.analysis && (
                <div className="px-3 pb-3 border-t border-white/[0.07] mt-0">
                  <p className="text-slate-400 leading-relaxed pt-3 pb-2">{alert.analysis}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {alert.level !== "INFO" && (
                      <button
                        onClick={e => { e.stopPropagation(); setDraftAlert(alert); }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded border ${cfg.border} ${cfg.color} text-[10px] hover:opacity-80 transition-opacity`}
                      >
                        <FileText size={9} />
                        Draft Notice
                      </button>
                    )}
                    {alert.action_links && alert.action_links.map((link, j) => (
                      <a
                        key={j}
                        href={link.href}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded border ${cfg.border} ${cfg.color} text-[10px] hover:opacity-80 transition-opacity`}
                        onClick={e => e.stopPropagation()}
                      >
                        {link.label}
                        <ExternalLink size={9} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <DraftNoticeModal alert={draftAlert} onClose={() => setDraftAlert(null)} />
    </div>
  );
}
