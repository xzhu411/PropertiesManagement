"use client";

import { NPVModel } from "@/lib/types";
import { TrendingUp, TrendingDown } from "lucide-react";

function Row({ label, applicant, market, highlight }: {
  label: string;
  applicant: string;
  market: string;
  highlight?: boolean;
}) {
  return (
    <tr className={highlight ? "border-t border-white/[0.07]" : ""}>
      <td className={`py-2 pr-4 text-sm ${highlight ? "text-slate-100 font-medium" : "text-slate-500"}`}>{label}</td>
      <td className={`py-2 pr-4 text-right text-sm ${highlight ? "text-slate-100 font-medium" : "text-slate-300"}`}>{applicant}</td>
      <td className={`py-2 text-right text-sm ${highlight ? "text-slate-400" : "text-slate-600"}`}>{market}</td>
    </tr>
  );
}

export default function NPVImpactModel({ npv }: { npv: NPVModel }) {
  const { applicant: a, market_average: m } = npv;
  const positive = npv.delta_vs_market >= 0;

  return (
    <div className="bg-[#13161f] border border-white/[0.07] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[13px] text-slate-500 uppercase tracking-wider">12-Month NPV Impact</p>
        <div className={`flex items-center gap-1 text-sm font-medium ${positive ? "text-[#84cc16]" : "text-red-400"}`}>
          {positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {positive ? "+" : ""}{npv.delta_pct.toFixed(1)}% vs. market avg
        </div>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.07]">
            <th className="text-left pb-2 text-xs text-slate-600 font-normal">Metric</th>
            <th className="text-right pb-2 text-xs text-slate-400 font-normal">This Applicant</th>
            <th className="text-right pb-2 text-xs text-slate-600 font-normal">Market Avg</th>
          </tr>
        </thead>
        <tbody>
          <Row
            label={`12-mo Gross Rent ($${npv.monthly_rent.toLocaleString()} × 12)`}
            applicant={`$${(npv.monthly_rent * 12).toLocaleString()}`}
            market={`$${(npv.monthly_rent * 12).toLocaleString()}`}
          />
          <Row label="Vacancy Probability" applicant={`${a.vacancy_probability_pct}%`} market={`${m.vacancy_probability_pct}%`} />
          <Row label="Expected Vacancy Cost" applicant={`($${a.expected_vacancy_cost.toLocaleString()})`} market={`($${m.expected_vacancy_cost.toLocaleString()})`} />
          <Row label="Eviction Probability" applicant={`${a.eviction_probability_pct}%`} market={`${m.eviction_probability_pct}%`} />
          <Row label="Expected Eviction Cost" applicant={`($${a.expected_eviction_cost.toLocaleString()})`} market={`($${m.expected_eviction_cost.toLocaleString()})`} />
          <Row
            label="Expected Net Revenue (12mo)"
            applicant={`$${a.expected_net_revenue_12mo.toLocaleString()}`}
            market={`$${m.expected_net_revenue_12mo.toLocaleString()}`}
            highlight
          />
        </tbody>
      </table>

      <div className={`mt-3 p-3 rounded border ${positive ? "border-[#84cc16]/20 bg-[#84cc16]/5" : "border-red-500/20 bg-red-500/5"}`}>
        <p className={`text-sm font-medium ${positive ? "text-[#84cc16]" : "text-red-400"}`}>
          Δ vs. Market Average: {positive ? "+" : ""}${npv.delta_vs_market.toLocaleString()} ({positive ? "+" : ""}{npv.delta_pct.toFixed(1)}%)
        </p>
        <p className="text-xs text-slate-600 mt-0.5">
          Assumptions: vacancy cost ${npv.npv_assumptions.vacancy_cost_per_month.toLocaleString()} · eviction cost ${npv.npv_assumptions.eviction_cost_estimate.toLocaleString()} · discount rate {npv.npv_assumptions.discount_rate_annual_pct}%
        </p>
      </div>
    </div>
  );
}
