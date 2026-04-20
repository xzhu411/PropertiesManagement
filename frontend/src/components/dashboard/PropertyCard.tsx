"use client";

import { Property } from "@/lib/types";
import { MapPin, TrendingUp, TrendingDown } from "lucide-react";

function RiskDot({ score }: { score: number }) {
  const color = score >= 75 ? "bg-red-400" : score >= 50 ? "bg-amber-400" : "bg-[#84cc16]";
  const label = score >= 75 ? "High Risk" : score >= 50 ? "Watch" : "Stable";
  const textColor = score >= 75 ? "text-red-400" : score >= 50 ? "text-amber-400" : "text-[#84cc16]";
  return (
    <span className={`flex items-center gap-1.5 text-[10px] font-semibold tracking-wide ${textColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
      {label.toUpperCase()}
    </span>
  );
}

function DSCRBadge({ dscr }: { dscr: number }) {
  const warn = dscr < 1.25;
  const ok = dscr >= 1.35;
  const color = warn ? "text-red-400 bg-red-500/10 border-red-500/20"
    : ok ? "text-[#84cc16] bg-[#84cc16]/10 border-[#84cc16]/20"
    : "text-amber-400 bg-amber-500/10 border-amber-500/20";
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${color}`}>
      {warn && "⚠ "}DSCR {dscr.toFixed(2)}x
    </span>
  );
}

export default function PropertyCard({ property, onClick }: { property: Property; onClick?: () => void }) {
  const { financials: f, debt: d } = property;
  const belowMarket = property.rent_vs_market_pct < 0;

  return (
    <div
      className="bg-[#13161f] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.15] hover:bg-[#161b25] transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">{property.name}</h3>
          <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
            <MapPin size={9} />{property.city}
          </p>
        </div>
        <RiskDot score={property.ai_risk_score} />
      </div>

      <div className="mb-4">
        <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">NOI / yr</p>
        <p className="text-2xl font-bold text-slate-100 leading-none">
          ${(f.noi_annual / 1_000_000).toFixed(2)}M
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-[10px] text-slate-600 mb-0.5">Occupancy</p>
          <p className={`text-sm font-semibold ${f.physical_occupancy_pct < 90 ? "text-red-400" : "text-slate-200"}`}>
            {f.physical_occupancy_pct}%
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-600 mb-0.5">Cap Rate</p>
          <p className="text-sm font-semibold text-slate-200">{f.cap_rate.toFixed(2)}%</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-600 mb-0.5">LTV</p>
          <p className="text-sm font-semibold text-slate-200">{d.ltv_pct.toFixed(0)}%</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-600 mb-0.5">Maturity</p>
          <p className="text-sm font-semibold text-slate-200">{d.maturity_date.slice(0, 7)}</p>
        </div>
      </div>

      {/* DSCR row */}
      <div className="flex items-center justify-between py-2.5 border-t border-b border-white/[0.06] mb-3">
        <div className="flex items-center gap-2">
          <DSCRBadge dscr={d.dscr} />
          <span className="text-[10px] text-slate-600">
            DS ${(d.annual_debt_service / 1_000).toFixed(0)}K/yr
          </span>
        </div>
        <span className="text-[10px] text-slate-600">
          ${(d.loan_balance / 1_000_000).toFixed(1)}M loan @ {d.interest_rate_pct}%
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[11px] text-slate-600">{property.units} units · {property.asset_class}</span>
        <span className={`text-[11px] flex items-center gap-1 font-medium ${belowMarket ? "text-amber-400" : "text-[#84cc16]"}`}>
          {belowMarket ? <TrendingDown size={9} /> : <TrendingUp size={9} />}
          {belowMarket ? "" : "+"}{property.rent_vs_market_pct}%
        </span>
      </div>

      {f.collection_rate_pct < 95 && (
        <div className="mt-3 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] text-amber-400 font-medium">
          Collection {f.collection_rate_pct}% — below threshold
        </div>
      )}
    </div>
  );
}
