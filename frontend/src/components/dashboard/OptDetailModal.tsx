"use client";

import { X, TrendingUp } from "lucide-react";
import { UnitOptimization, RentOptimization } from "@/lib/types";

interface Props {
  opt: UnitOptimization | null;
  property: RentOptimization | null;
  onClose: () => void;
}

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

function StatBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-[#1a1e2a] border border-white/[0.07] rounded-lg p-3">
      <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-base font-semibold ${color ?? "text-slate-100"}`}>{value}</p>
    </div>
  );
}

export default function OptDetailModal({ opt, property, onClose }: Props) {
  if (!opt || !property) return null;

  const retainUplift = opt.rent_increase * opt.count * 12 * (opt.retention_probability_pct / 100);
  const churnCost = opt.vacancy_cost_if_churned * opt.count * (opt.churn_probability_pct / 100);
  const retainPct = (retainUplift / (retainUplift + churnCost)) * 100;

  const breakeven = (opt.vacancy_cost_if_churned / (opt.rent_increase * 12)) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-[#13161f] border border-white/[0.07] rounded-xl w-full max-w-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-5 py-4 border-b border-white/[0.07]">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">{property.property_name} — {opt.unit_type}</h2>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {opt.count} units · Current ${opt.current_rent}/mo · Market ${opt.market_rent}/mo · Cap {property.cap_rate}%
            </p>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-300 transition-colors p-1 ml-4">
            <X size={14} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* EV headline */}
          <div className="flex items-center justify-between p-3 bg-[#84cc16]/5 border border-[#84cc16]/20 rounded-lg">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Expected Value (12mo/unit)</p>
              <p className="text-2xl font-semibold text-[#84cc16] mt-0.5 flex items-center gap-2">
                <TrendingUp size={16} /> +{fmt(opt.expected_value_12mo)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500">All {opt.count} units potential</p>
              <p className="text-sm font-semibold text-slate-100">{fmt(opt.annual_uplift_if_all_units)}/yr</p>
            </div>
          </div>

          {/* 4-stat grid */}
          <div className="grid grid-cols-2 gap-2">
            <StatBox label="Rent increase" value={`+$${opt.rent_increase}/mo (+${opt.rent_increase_pct}%)`} color="text-[#84cc16]" />
            <StatBox label="Retention probability" value={`${opt.retention_probability_pct}%`} />
            <StatBox label="Churn cost if tenant lost" value={`$${opt.vacancy_cost_if_churned.toLocaleString()}`} color="text-amber-400" />
            <StatBox label="Churn probability" value={`${opt.churn_probability_pct}%`} />
          </div>

          {/* Retain vs churn bar */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-500 mb-1.5">
              <span>Retain scenario (all units): <span className="text-[#84cc16] font-medium">+{fmt(retainUplift)}</span></span>
              <span>Churn cost (all units): <span className="text-amber-400 font-medium">−{fmt(churnCost)}</span></span>
            </div>
            <div className="h-2 bg-white/[0.08] rounded-full overflow-hidden flex">
              <div className="bg-[#84cc16]/70 h-full rounded-l-full" style={{ width: `${retainPct}%` }} />
              <div className="bg-amber-400/40 h-full rounded-r-full flex-1" />
            </div>
          </div>

          {/* Assumptions */}
          <div className="border border-white/[0.07] rounded-lg divide-y divide-white/[0.06] text-xs">
            <div className="flex justify-between px-3 py-2">
              <span className="text-slate-500">Vacancy cost assumption</span>
              <span className="text-slate-100">${opt.vacancy_cost_if_churned.toLocaleString()} (1mo lost + turn + leasing)</span>
            </div>
            <div className="flex justify-between px-3 py-2">
              <span className="text-slate-500">Breakeven churn rate</span>
              <span className="text-slate-100">{breakeven.toFixed(1)}% — current is {opt.churn_probability_pct}%</span>
            </div>
            <div className="flex justify-between px-3 py-2">
              <span className="text-slate-500">CRE benchmark cap rate</span>
              <span className={`font-medium ${property.cap_rate_vs_benchmark_bps >= 0 ? "text-[#84cc16]" : "text-amber-400"}`}>
                {property.cap_rate}% ({property.cap_rate_vs_benchmark_bps > 0 ? "+" : ""}{property.cap_rate_vs_benchmark_bps}bps vs {property.cre_benchmark_cap_rate}% benchmark)
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 bg-[#1a1e2a] rounded-lg p-3">
            <span className="font-medium text-slate-300">Recommendation: </span>
            At {opt.retention_probability_pct}% retention, the expected uplift of {fmt(retainUplift)} outweighs
            the {opt.churn_probability_pct}% churn risk costing {fmt(churnCost)}. Net EV is positive — raise to
            market at next renewal. Breakeven churn rate is {breakeven.toFixed(1)}%; current estimate is well below this threshold.
          </p>
        </div>
      </div>
    </div>
  );
}
