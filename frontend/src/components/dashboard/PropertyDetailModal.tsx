"use client";

import { Property } from "@/lib/types";
import { X, TrendingUp, TrendingDown, MapPin, Calendar, DollarSign } from "lucide-react";

interface Props {
  property: Property | null;
  onClose: () => void;
}

function StatRow({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2 ${highlight ? "border-t border-white/[0.07] mt-1 pt-3" : ""}`}>
      <span className={`text-xs ${highlight ? "text-slate-100 font-medium" : "text-slate-500"}`}>{label}</span>
      <div className="text-right">
        <span className={`text-xs ${highlight ? "text-slate-100 font-semibold" : "text-slate-300"}`}>{value}</span>
        {sub && <p className="text-[10px] text-slate-600">{sub}</p>}
      </div>
    </div>
  );
}

export default function PropertyDetailModal({ property: p, onClose }: Props) {
  if (!p) return null;

  const unrealized = p.current_value - p.acquisition_price;
  const unrealizedPct = (unrealized / p.acquisition_price) * 100;
  const belowMarket = p.rent_vs_market_pct < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-[#13161f] border border-white/[0.07] rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#13161f] border-b border-white/[0.07] px-6 py-4 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-100">{p.name}</h2>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin size={10} /> {p.address}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-100 transition-colors p-1">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Key metrics row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "NOI / yr", value: `$${(p.financials.noi_annual / 1_000_000).toFixed(2)}M` },
              { label: "Cap Rate", value: `${p.financials.cap_rate.toFixed(2)}%`, sub: "vs 5.20% CRE benchmark" },
              { label: "Occupancy", value: `${p.financials.physical_occupancy_pct}%` },
              { label: "AUM", value: `$${(p.current_value / 1_000_000).toFixed(1)}M` },
            ].map(({ label, value, sub }) => (
              <div key={label} className="bg-[#1a1e2a] border border-white/[0.07] rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-600 uppercase tracking-wider">{label}</p>
                <p className="text-lg font-semibold text-slate-100 mt-1">{value}</p>
                {sub && <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>}
              </div>
            ))}
          </div>

          {/* Financials */}
          <div>
            <h3 className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">Income Statement (Monthly)</h3>
            <div className="bg-[#1a1e2a] border border-white/[0.07] rounded-xl px-4 divide-y divide-white/[0.06]">
              <StatRow label="Gross Potential Rent" value={`$${p.financials.gross_potential_rent_monthly.toLocaleString()}`} />
              <StatRow label="Physical Occupancy" value={`${p.financials.physical_occupancy_pct}%`} />
              <StatRow label="Economic Occupancy" value={`${p.financials.economic_occupancy_pct}%`} sub="after concessions & loss-to-lease" />
              <StatRow label="Effective Gross Revenue" value={`$${p.financials.total_revenue_monthly.toLocaleString()}`} />
              <StatRow label="Operating Expenses" value={`($${p.financials.operating_expenses_monthly.toLocaleString()})`} />
              <StatRow label="Monthly NOI" value={`$${p.financials.noi_monthly.toLocaleString()}`} highlight />
              <StatRow label="Collection Rate" value={`${p.financials.collection_rate_pct}%`} />
            </div>
          </div>

          {/* Unit Mix */}
          <div>
            <h3 className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">Unit Mix</h3>
            <div className="bg-[#1a1e2a] border border-white/[0.07] rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.07]">
                    <th className="text-left px-4 py-2.5 text-slate-600 font-normal">Type</th>
                    <th className="text-right px-4 py-2.5 text-slate-600 font-normal">Units</th>
                    <th className="text-right px-4 py-2.5 text-slate-600 font-normal">Sq Ft</th>
                    <th className="text-right px-4 py-2.5 text-slate-600 font-normal">Market Rent</th>
                    <th className="text-right px-4 py-2.5 text-slate-600 font-normal">Monthly Rev.</th>
                  </tr>
                </thead>
                <tbody>
                  {p.unit_mix.map((u) => (
                    <tr key={u.type} className="border-b border-white/[0.06] hover:bg-white/[0.06]">
                      <td className="px-4 py-2.5 text-slate-300">{u.type}</td>
                      <td className="px-4 py-2.5 text-right text-slate-300">{u.count}</td>
                      <td className="px-4 py-2.5 text-right text-slate-500">{u.sqft.toLocaleString()} sf</td>
                      <td className="px-4 py-2.5 text-right text-slate-100">${u.market_rent.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right text-slate-300">${(u.market_rent * u.count).toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#1e2230]">
                    <td className="px-4 py-2.5 text-slate-400 font-medium">Total</td>
                    <td className="px-4 py-2.5 text-right text-slate-100 font-medium">{p.units}</td>
                    <td className="px-4 py-2.5" />
                    <td className="px-4 py-2.5" />
                    <td className="px-4 py-2.5 text-right text-slate-100 font-medium">
                      ${p.unit_mix.reduce((s, u) => s + u.market_rent * u.count, 0).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Investment Summary */}
          <div>
            <h3 className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">Investment Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1a1e2a] border border-white/[0.07] rounded-xl px-4 divide-y divide-white/[0.06]">
                <StatRow label="Acquisition Price" value={`$${(p.acquisition_price / 1_000_000).toFixed(1)}M`} />
                <StatRow label="Current Value" value={`$${(p.current_value / 1_000_000).toFixed(1)}M`} />
                <StatRow
                  label="Unrealized Gain"
                  value={`${unrealizedPct > 0 ? "+" : ""}${unrealizedPct.toFixed(1)}%`}
                  highlight
                />
              </div>
              <div className="bg-[#1a1e2a] border border-white/[0.07] rounded-xl px-4 divide-y divide-white/[0.06]">
                <StatRow label="Asset Class" value={p.asset_class} />
                <StatRow label="Vintage" value={String(p.vintage)} />
                <StatRow
                  label="Rent vs. Market"
                  value={`${belowMarket ? "" : "+"}${p.rent_vs_market_pct}%`}
                  highlight
                />
              </div>
            </div>
          </div>

          {/* Debt & Coverage */}
          {p.debt && (
            <div>
              <h3 className="text-[11px] text-slate-500 uppercase tracking-wider mb-2">Debt &amp; Coverage</h3>
              <div className="bg-[#1a1e2a] border border-white/[0.07] rounded-xl px-4 divide-y divide-white/[0.06]">
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-slate-500">DSCR</span>
                  <span className={`text-xs font-semibold ${
                    p.debt.dscr >= 1.35
                      ? "text-[#84cc16]"
                      : p.debt.dscr >= 1.25
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}>
                    {p.debt.dscr < 1.25 ? "⚠ " : ""}{p.debt.dscr.toFixed(2)}x
                  </span>
                </div>
                <StatRow
                  label="LTV"
                  value={`${p.debt.ltv_pct.toFixed(1)}%`}
                />
                <StatRow
                  label="Loan Balance"
                  value={`$${(p.debt.loan_balance / 1_000_000).toFixed(2)}M`}
                />
                <StatRow
                  label="Interest Rate"
                  value={`${p.debt.interest_rate_pct.toFixed(2)}%`}
                />
                <StatRow
                  label="Annual Debt Service"
                  value={`$${(p.debt.annual_debt_service / 1_000).toFixed(0)}K/yr`}
                />
                <StatRow
                  label="Loan Maturity"
                  value={p.debt.maturity_date}
                />
              </div>
            </div>
          )}

          {/* Lease rollover */}
          <div className="flex items-center justify-between p-3 bg-[#1a1e2a] border border-white/[0.07] rounded-xl">
            <div className="flex items-center gap-2">
              <Calendar size={13} className="text-slate-600" />
              <span className="text-xs text-slate-400">Leases expiring in 90 days</span>
            </div>
            <span className={`text-sm font-semibold ${p.lease_expirations_90d > 20 ? "text-amber-400" : "text-[#84cc16]"}`}>
              {p.lease_expirations_90d} units
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
