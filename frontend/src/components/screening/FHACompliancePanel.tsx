"use client";

import { FHACompliance } from "@/lib/types";
import { ShieldCheck, ShieldAlert } from "lucide-react";

export default function FHACompliancePanel({ compliance }: { compliance: FHACompliance }) {
  if (compliance.is_compliant) {
    return (
      <div className="bg-[#84cc16]/5 border border-[#84cc16]/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={15} className="text-[#84cc16]" />
          <p className="text-sm font-medium text-[#84cc16]">FHA Compliant</p>
        </div>
        <p className="text-sm text-slate-400">{compliance.overall_assessment}</p>
        <p className="text-xs text-slate-600 mt-1">42 U.S.C. § 3604 — No protected class exposure identified</p>
      </div>
    );
  }

  return (
    <div className="bg-red-500/5 border border-red-500/30 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-2">
        <ShieldAlert size={15} className="text-red-400" />
        <p className="text-sm font-medium text-red-400">FHA Compliance Flag</p>
        <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 ml-auto">
          {compliance.flags.length} issue{compliance.flags.length > 1 ? "s" : ""}
        </span>
      </div>
      <p className="text-sm text-slate-400 mb-3">{compliance.overall_assessment}</p>

      <div className="space-y-3">
        {compliance.flags.map((flag, i) => (
          <div key={i} className="bg-red-500/10 rounded p-3 space-y-1.5">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
              {flag.protected_class}
            </span>
            <p className="text-sm text-slate-300">{flag.trigger}</p>
            <p className="text-xs text-slate-500 font-mono">{flag.legal_citation}</p>
            <div className="mt-2 pt-2 border-t border-red-500/10">
              <p className="text-xs text-slate-500 mb-0.5">Compliant alternative:</p>
              <p className="text-sm text-[#84cc16]">{flag.compliant_alternative}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
