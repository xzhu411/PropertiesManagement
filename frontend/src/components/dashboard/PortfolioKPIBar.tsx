"use client";

import { PortfolioSummary } from "@/lib/types";
import { TrendingUp, AlertTriangle, Clock, BarChart2 } from "lucide-react";

export type KPIKey = "noi" | "occupancy" | "collection" | "leases" | "dscr";

interface Props {
  summary: PortfolioSummary;
  onKPIClick?: (key: KPIKey) => void;
}

function Stat({
  label, value, sub, warn, icon, onClick,
}: {
  label: string; value: string; sub: string; warn?: boolean; icon: React.ReactNode; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 text-left px-4 py-4 md:px-7 md:py-6 hover:bg-white/[0.03] transition-colors group"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-semibold tracking-[0.12em] text-slate-600 uppercase">{label}</span>
        <span className="text-slate-700 group-hover:text-slate-500 transition-colors">{icon}</span>
      </div>
      <p className="text-3xl md:text-[2.75rem] font-bold text-slate-100 leading-none tracking-tight">{value}</p>
      <p className={`text-[11px] mt-3 font-medium ${warn ? "text-amber-400" : "text-slate-600"}`}>{sub}</p>
    </button>
  );
}

export default function PortfolioKPIBar({ summary, onKPIClick }: Props) {
  const collectionWarn = summary.blended_collection_rate < 95;
  const occupancyWarn = summary.blended_occupancy_pct < 93;
  const leasesWarn = summary.leases_expiring_90d > 30;
  const dscrWarn = summary.blended_dscr < 1.35;
  const dscrAlert = summary.dscr_watch_properties?.length > 0;

  return (
    <div className="bg-[#13161f] border border-white/[0.07] rounded-2xl flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/[0.07] overflow-hidden">
      <Stat
        label="Portfolio NOI"
        value={`$${(summary.total_noi_annual / 1_000_000).toFixed(1)}M`}
        sub={`Cap ${summary.blended_cap_rate.toFixed(2)}% · benchmark ${summary.cre_multifamily_benchmark_cap_rate}%`}
        icon={<BarChart2 size={13} />}
        onClick={() => onKPIClick?.("noi")}
      />
      <Stat
        label="Blended Occupancy"
        value={`${summary.blended_occupancy_pct}%`}
        sub={occupancyWarn ? "Below 93% target" : "On target"}
        warn={occupancyWarn}
        icon={<TrendingUp size={13} />}
        onClick={() => onKPIClick?.("occupancy")}
      />
      <Stat
        label="Rent Collection"
        value={`${summary.blended_collection_rate}%`}
        sub={collectionWarn ? "Below 95% threshold" : "Within target"}
        warn={collectionWarn}
        icon={collectionWarn ? <AlertTriangle size={13} /> : <TrendingUp size={13} />}
        onClick={() => onKPIClick?.("collection")}
      />
      <Stat
        label="Lease Expirations"
        value={`${summary.leases_expiring_90d}`}
        sub="units in next 90 days"
        warn={leasesWarn}
        icon={<Clock size={13} />}
        onClick={() => onKPIClick?.("leases")}
      />
      <Stat
        label="Portfolio DSCR"
        value={`${summary.blended_dscr.toFixed(2)}x`}
        sub={
          dscrAlert
            ? `⚠ ${summary.dscr_watch_properties[0]} below covenant`
            : dscrWarn ? "Watch — approaching 1.25x floor" : "Above 1.25x covenant"
        }
        warn={dscrAlert || dscrWarn}
        icon={dscrAlert ? <AlertTriangle size={13} /> : <BarChart2 size={13} />}
        onClick={() => onKPIClick?.("dscr")}
      />
    </div>
  );
}
