"use client";

import { ApplicantPreset, TenantApplication } from "@/lib/types";

const PROPERTY_NAMES: Record<string, string> = {
  "OAK-001": "Oakwood Apartments, Chicago",
  "RIV-002": "Riverside Commons, Austin",
  "LPT-003": "Lincoln Park Tower, NYC",
  "SNS-004": "Sunset Ridge, Phoenix",
};

const badgeConfig: Record<string, string> = {
  green: "border-[#84cc16]/40 text-[#84cc16] bg-[#84cc16]/5",
  yellow: "border-amber-500/40 text-amber-400 bg-amber-500/5",
  orange: "border-orange-500/40 text-orange-400 bg-orange-500/5",
  red: "border-red-500/40 text-red-400 bg-red-500/5",
};

const outcomeLabel: Record<string, string> = {
  APPROVED: "→ APPROVED",
  CONDITIONAL: "→ CONDITIONAL",
  DENIED: "→ DENIED",
};

interface Props {
  presets: ApplicantPreset[];
  selected: string | null;
  application: TenantApplication | null;
  loading: boolean;
  cached: boolean;
  onSelect: (preset: ApplicantPreset) => void;
  onAnalyze: () => void;
}

export default function PresetApplicantPicker({ presets, selected, application, loading, cached, onSelect, onAnalyze }: Props) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Quick-load demo profiles</p>
      <div className="space-y-2">
        {presets.map((p) => {
          const isSelected = selected === p.id;
          const badge = badgeConfig[p.badge_color] || badgeConfig.yellow;
          return (
            <div key={p.id}>
              <button
                onClick={() => onSelect(p)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  isSelected
                    ? "border-[#84cc16]/40 bg-[#1a1e2a] rounded-b-none"
                    : "border-white/[0.07] bg-[#13161f] hover:border-white/[0.15] hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-100 truncate">{p.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{p.label}</p>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${badge} shrink-0`}>
                    {outcomeLabel[p.expected_outcome]}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-slate-600">
                  <span>${p.monthly_gross_income.toLocaleString()}/mo</span>
                  <span>·</span>
                  <span>${p.target_unit_rent.toLocaleString()}/mo rent</span>
                  <span>·</span>
                  <span>{p.credit_score_range}</span>
                </div>
                {p.id === "A3" && (
                  <div className="mt-1.5 text-xs text-orange-400">
                    ★ FHA compliance demo — recommended
                  </div>
                )}
              </button>

              {isSelected && application && (
                <div className="bg-[#1a1e2a] border border-[#84cc16]/40 border-t-0 rounded-b-xl px-4 pt-3 pb-4 space-y-3">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <p className="text-slate-600 text-xs">Income</p>
                      <p className="text-slate-100">${application.monthly_gross_income.toLocaleString()}/mo</p>
                    </div>
                    <div>
                      <p className="text-slate-600 text-xs">Rent</p>
                      <p className="text-slate-100">${application.target_unit_rent.toLocaleString()}/mo</p>
                    </div>
                    <div>
                      <p className="text-slate-600 text-xs">Credit</p>
                      <p className="text-slate-100">{application.credit_score_range}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 text-xs">Employment</p>
                      <p className="text-slate-100">{application.employment_months}mo</p>
                    </div>
                    <div>
                      <p className="text-slate-600 text-xs">Rental history</p>
                      <p className="text-slate-100">{application.rental_history_months}mo</p>
                    </div>
                    <div>
                      <p className="text-slate-600 text-xs">Late payments</p>
                      <p className={`${application.late_payments_12mo > 0 ? "text-amber-400" : "text-slate-100"}`}>
                        {application.late_payments_12mo}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">{PROPERTY_NAMES[application.property_id]}</p>
                  {application.additional_notes && (
                    <p className="text-xs text-slate-500 italic">{application.additional_notes}</p>
                  )}
                  <button
                    onClick={onAnalyze}
                    disabled={loading}
                    className="w-full py-2 px-4 rounded-lg bg-[#84cc16] text-black text-sm font-semibold hover:bg-[#6fac10] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Analyzing..." : cached ? "Re-analyze →" : "Analyze Application →"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
