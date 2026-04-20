"use client";

import { Property, LeaseExpiry } from "@/lib/types";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import { KPIKey } from "./PortfolioKPIBar";

interface Props {
  kpiKey: KPIKey | null;
  properties: Property[];
  leaseExpiry: LeaseExpiry[];
  onClose: () => void;
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="w-full bg-white/[0.08] rounded-full h-1.5 mt-1">
      <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

function NOIContent({ properties }: { properties: Property[] }) {
  const totalNOI = properties.reduce((s, p) => s + p.financials.noi_annual, 0);
  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">NOI contribution by property. Blended cap rate 4.94% vs CBRE multifamily benchmark 5.20%.</p>
      <div className="space-y-3">
        {properties.map(p => {
          const pct = (p.financials.noi_annual / totalNOI) * 100;
          const belowBenchmark = p.financials.cap_rate < 5.20;
          return (
            <div key={p.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-300">{p.name}</span>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] ${belowBenchmark ? "text-amber-400" : "text-[#84cc16]"}`}>
                    {belowBenchmark ? <TrendingDown className="inline" size={9} /> : <TrendingUp className="inline" size={9} />} {p.financials.cap_rate.toFixed(2)}% cap
                  </span>
                  <span className="text-xs text-slate-100 font-medium">${(p.financials.noi_annual / 1_000_000).toFixed(2)}M</span>
                  <span className="text-[10px] text-slate-600 w-8 text-right">{pct.toFixed(0)}%</span>
                </div>
              </div>
              <Bar pct={pct} color="bg-[#84cc16]/70" />
            </div>
          );
        })}
      </div>
      <div className="pt-3 border-t border-white/[0.07] flex justify-between text-xs">
        <span className="text-slate-500">Total Portfolio NOI</span>
        <span className="text-slate-100 font-semibold">${(totalNOI / 1_000_000).toFixed(2)}M / yr</span>
      </div>
    </div>
  );
}

function OccupancyContent({ properties }: { properties: Property[] }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">Physical occupancy by property. Target: 93%+. Units below 90% trigger pricing review.</p>
      <div className="space-y-3">
        {properties.map(p => {
          const occ = p.financials.physical_occupancy_pct;
          const color = occ < 90 ? "bg-red-500/70" : occ < 93 ? "bg-amber-500/70" : "bg-[#84cc16]/70";
          const textColor = occ < 90 ? "text-red-400" : occ < 93 ? "text-amber-400" : "text-[#84cc16]";
          return (
            <div key={p.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-300">{p.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-600">{p.units} units</span>
                  <span className={`text-xs font-medium ${textColor}`}>{occ}%</span>
                </div>
              </div>
              <Bar pct={occ} color={color} />
            </div>
          );
        })}
      </div>
      <div className="pt-3 border-t border-white/[0.07] text-[10px] text-slate-600">
        Economic occupancy (after concessions): avg {(properties.reduce((s, p) => s + p.financials.economic_occupancy_pct, 0) / properties.length).toFixed(1)}%
      </div>
    </div>
  );
}

function CollectionContent({ properties }: { properties: Property[] }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">Rent collection rate by property. Below 95% triggers delinquency review and notice issuance.</p>
      <div className="space-y-3">
        {properties.map(p => {
          const rate = p.financials.collection_rate_pct;
          const outstanding = p.financials.total_revenue_monthly * ((100 - rate) / 100);
          const color = rate < 95 ? "bg-amber-500/70" : "bg-[#84cc16]/70";
          const textColor = rate < 95 ? "text-amber-400" : "text-[#84cc16]";
          return (
            <div key={p.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-300">{p.name}</span>
                <div className="flex items-center gap-3">
                  {rate < 95 && (
                    <span className="text-[10px] text-red-400">
                      ${outstanding.toFixed(0)} outstanding
                    </span>
                  )}
                  <span className={`text-xs font-medium ${textColor}`}>{rate}%</span>
                </div>
              </div>
              <Bar pct={rate} color={color} />
            </div>
          );
        })}
      </div>
      <div className="pt-3 border-t border-white/[0.07] text-[10px] text-slate-600">
        Blended rate 95.8% — Riverside Commons (91.2%) is primary drag. Texas Property Code §91.001 allows 5-day notice to cure.
      </div>
    </div>
  );
}

function LeasesContent({ leaseExpiry }: { leaseExpiry: LeaseExpiry[] }) {
  const byCritical = leaseExpiry.filter(l => l.urgency === "CRITICAL");
  const byHigh = leaseExpiry.filter(l => l.urgency === "HIGH");
  const byMonth: Record<string, number> = {};
  leaseExpiry.forEach(l => {
    const mo = l.expires.slice(0, 7);
    byMonth[mo] = (byMonth[mo] ?? 0) + 1;
  });
  const totalAtRisk = leaseExpiry.reduce((s, l) => s + (l.renewal_status === "No response" ? l.rent : 0), 0);

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">76 leases expiring across 4 properties in the next 90 days. No-response units represent immediate revenue risk.</p>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#1a1e2a] border border-red-500/20 rounded-lg p-3 text-center">
          <p className="text-[10px] text-slate-600 uppercase tracking-wider">Critical</p>
          <p className="text-xl font-semibold text-red-400 mt-1">{byCritical.length}</p>
          <p className="text-[10px] text-slate-600">≤14 days</p>
        </div>
        <div className="bg-[#1a1e2a] border border-amber-500/20 rounded-lg p-3 text-center">
          <p className="text-[10px] text-slate-600 uppercase tracking-wider">High</p>
          <p className="text-xl font-semibold text-amber-400 mt-1">{byHigh.length}</p>
          <p className="text-[10px] text-slate-600">15–30 days</p>
        </div>
        <div className="bg-[#1a1e2a] border border-white/[0.07] rounded-lg p-3 text-center">
          <p className="text-[10px] text-slate-600 uppercase tracking-wider">Revenue at Risk</p>
          <p className="text-lg font-semibold text-amber-400 mt-1">${totalAtRisk.toLocaleString()}</p>
          <p className="text-[10px] text-slate-600">no-response units/mo</p>
        </div>
      </div>
      <div>
        <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">Expiry by month</p>
        {Object.entries(byMonth).sort().map(([mo, count]) => (
          <div key={mo} className="flex items-center gap-3 mb-1.5">
            <span className="text-[10px] text-slate-500 w-20">{mo}</span>
            <div className="flex-1 bg-white/[0.08] rounded-full h-1.5">
              <div className="bg-amber-500/60 h-1.5 rounded-full" style={{ width: `${(count / leaseExpiry.length) * 100}%` }} />
            </div>
            <span className="text-[10px] text-slate-400 w-12 text-right">{count} units</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DSCRContent({ properties }: { properties: Property[] }) {
  const totalDS = properties.reduce((s, p) => s + (p.debt?.annual_debt_service ?? 0), 0);
  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        DSCR by property. Covenant floor 1.25x — breach triggers lender notification and potential acceleration.
      </p>
      <div className="space-y-3">
        {properties.map(p => {
          const dscr = p.debt?.dscr ?? 0;
          const dscrColor =
            dscr >= 1.35 ? "bg-[#84cc16]/70" : dscr >= 1.25 ? "bg-amber-500/70" : "bg-red-500/70";
          const dscrText =
            dscr >= 1.35 ? "text-[#84cc16]" : dscr >= 1.25 ? "text-amber-400" : "text-red-400";
          const isRiverside = p.name === "Riverside Commons";
          const barPct = Math.min((dscr / 2) * 100, 100);
          return (
            <div key={p.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-300">{p.name}</span>
                  {isRiverside && (
                    <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 rounded px-1 py-0.5 font-medium">
                      COVENANT BREACH
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-600">
                    ${(p.debt?.loan_balance / 1_000_000).toFixed(1)}M · LTV {p.debt?.ltv_pct.toFixed(0)}%
                  </span>
                  <span className="text-[10px] text-slate-600">
                    DS ${(p.debt?.annual_debt_service / 1_000).toFixed(0)}K/yr
                  </span>
                  <span className={`text-xs font-semibold ${dscrText}`}>
                    {dscr < 1.25 ? "⚠ " : ""}{dscr.toFixed(2)}x
                  </span>
                </div>
              </div>
              <Bar pct={barPct} color={dscrColor} />
            </div>
          );
        })}
      </div>
      <div className="pt-3 border-t border-white/[0.07] flex justify-between text-xs">
        <span className="text-slate-500">Total Annual Debt Service</span>
        <span className="text-slate-100 font-semibold">${(totalDS / 1_000_000).toFixed(2)}M / yr</span>
      </div>
    </div>
  );
}

const titles: Record<KPIKey, string> = {
  noi: "Portfolio NOI Breakdown",
  occupancy: "Occupancy by Property",
  collection: "Rent Collection Analysis",
  leases: "Lease Expiration Breakdown",
  dscr: "Debt Service Coverage by Property",
};

export default function KPIDetailModal({ kpiKey, properties, leaseExpiry, onClose }: Props) {
  if (!kpiKey) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-[#13161f] border border-white/[0.07] rounded-xl w-full max-w-lg shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <h2 className="text-sm font-semibold text-slate-100">{titles[kpiKey]}</h2>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-100 transition-colors p-1">
            <X size={14} />
          </button>
        </div>
        <div className="px-5 py-4">
          {kpiKey === "noi" && <NOIContent properties={properties} />}
          {kpiKey === "occupancy" && <OccupancyContent properties={properties} />}
          {kpiKey === "collection" && <CollectionContent properties={properties} />}
          {kpiKey === "leases" && <LeasesContent leaseExpiry={leaseExpiry} />}
          {kpiKey === "dscr" && <DSCRContent properties={properties} />}
        </div>
      </div>
    </div>
  );
}
