"use client";

import { useState } from "react";
import { PortfolioSummary, Property, NOIPoint, LeaseExpiry, LeaseExpiryDistributionData, RiskAlert, RentOptimization } from "@/lib/types";
import PortfolioKPIBar, { KPIKey } from "@/components/dashboard/PortfolioKPIBar";
import NOIChart from "@/components/dashboard/NOIChart";
import PropertyCard from "@/components/dashboard/PropertyCard";
import LeaseExpiryTable from "@/components/dashboard/LeaseExpiryTable";
import LeaseExpiryDistribution from "@/components/dashboard/LeaseExpiryDistribution";
import AIRiskFeed from "@/components/dashboard/AIRiskFeed";
import RentOptimizationPanel from "@/components/dashboard/RentOptimizationPanel";
import PropertyDetailModal from "@/components/dashboard/PropertyDetailModal";
import KPIDetailModal from "@/components/dashboard/KPIDetailModal";

interface Props {
  summary: PortfolioSummary;
  properties: Property[];
  noiTrend: NOIPoint[];
  leaseExpiry: LeaseExpiry[];
  leaseDistribution: LeaseExpiryDistributionData;
  riskAlerts: RiskAlert[];
  rentOptimization: RentOptimization[];
}

export default function DashboardClient({ summary, properties, noiTrend, leaseExpiry, leaseDistribution, riskAlerts, rentOptimization }: Props) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [activeKPI, setActiveKPI] = useState<KPIKey | null>(null);

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between py-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Portfolio Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {summary.total_properties} properties · {summary.total_units} units · AUM ${(summary.total_aum / 1_000_000).toFixed(0)}M · Debt ${(summary.total_loan_balance / 1_000_000).toFixed(0)}M
          </p>
        </div>
        <p className="text-[11px] text-slate-600">Q2 2025 · Updated Apr 19</p>
      </div>

      <PortfolioKPIBar summary={summary} onKPIClick={setActiveKPI} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <NOIChart data={noiTrend} />
        </div>
        <AIRiskFeed alerts={riskAlerts} />
      </div>

      {/* Property Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Properties</h2>
          <p className="text-[10px] text-slate-600">Click a property for details</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} onClick={() => setSelectedProperty(p)} />
          ))}
        </div>
      </div>

      {/* Lease section: distribution chart + table side by side, then rent opt */}
      <div id="lease-expiry" className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <LeaseExpiryDistribution data={leaseDistribution} />
          <LeaseExpiryTable leases={leaseExpiry} />
        </div>
        <div id="rent-optimization" className="lg:col-span-2">
          <RentOptimizationPanel data={rentOptimization} />
        </div>
      </div>

      <PropertyDetailModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />
      <KPIDetailModal
        kpiKey={activeKPI}
        properties={properties}
        leaseExpiry={leaseExpiry}
        onClose={() => setActiveKPI(null)}
      />
    </div>
  );
}
