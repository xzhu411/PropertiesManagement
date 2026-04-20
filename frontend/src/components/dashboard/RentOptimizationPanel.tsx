"use client";

import { useState } from "react";
import { RentOptimization, UnitOptimization } from "@/lib/types";
import { TrendingUp } from "lucide-react";
import OptDetailModal from "./OptDetailModal";
import { fmt } from "@/lib/utils";

export default function RentOptimizationPanel({ data }: { data: RentOptimization[] }) {
  const [selected, setSelected] = useState<{ opt: UnitOptimization; property: RentOptimization } | null>(null);
  const totalUplift = data.reduce((s, d) => s + d.total_annual_uplift_potential, 0);

  return (
    <>
      <div className="bg-[#13161f] border border-white/[0.07] rounded-xl p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium text-slate-100">Rent Optimization</h3>
          <span className="text-[11px] text-[#84cc16]">Total EV uplift: {fmt(totalUplift)}/yr</span>
        </div>
        <p className="text-[11px] text-slate-600 mb-4">Units priced below market comps · Expected value analysis · Click for EV breakdown</p>

        <div className="space-y-4">
          {data.map((prop) => (
            <div key={prop.property_id} className="border-t border-white/[0.06] pt-4 first:border-t-0 first:pt-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-300">{prop.property_name}</span>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="text-slate-600">Cap: {prop.cap_rate}%</span>
                  <span className={prop.cap_rate_vs_benchmark_bps >= 0 ? "text-[#84cc16]" : "text-amber-500"}>
                    {prop.cap_rate_vs_benchmark_bps > 0 ? "+" : ""}{prop.cap_rate_vs_benchmark_bps}bps vs. CRE benchmark
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {prop.optimizations.map((opt) => (
                  <button
                    key={opt.unit_type}
                    className="w-full text-left bg-[#1a1e2a] border border-white/[0.07] rounded-lg p-3 text-xs hover:bg-white/[0.06] hover:border-[#84cc16]/30 transition-colors group"
                    onClick={() => setSelected({ opt, property: prop })}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-slate-400">{opt.unit_type} ({opt.count} units)</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          ${opt.current_rent}/mo → <span className="text-[#84cc16]">${opt.market_rent}/mo</span> (+{opt.rent_increase_pct}%)
                        </p>
                      </div>
                      <span className="text-[#84cc16] flex items-center gap-1 group-hover:opacity-80">
                        <TrendingUp size={11} />
                        EV: {fmt(opt.expected_value_12mo)}/unit
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-1.5">
                      Retain {opt.retention_probability_pct}% · Churn cost ${opt.vacancy_cost_if_churned.toLocaleString()} · {fmt(opt.annual_uplift_if_all_units)}/yr all units
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <OptDetailModal
        opt={selected?.opt ?? null}
        property={selected?.property ?? null}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
