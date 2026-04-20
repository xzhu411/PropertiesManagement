import { api } from "@/lib/api";
import { PortfolioSummary, Property, NOIPoint, LeaseExpiry, LeaseExpiryDistributionData, RiskAlert, RentOptimization } from "@/lib/types";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [summary, properties, noiTrend, leaseExpiry, leaseDistribution, riskAlerts, rentOptimization] = await Promise.all([
    api.portfolio.summary() as Promise<PortfolioSummary>,
    api.portfolio.properties() as Promise<Property[]>,
    api.portfolio.noiTrend() as Promise<NOIPoint[]>,
    api.portfolio.leaseExpiry() as Promise<LeaseExpiry[]>,
    api.portfolio.leaseExpiryDistribution() as Promise<LeaseExpiryDistributionData>,
    api.portfolio.riskAlerts() as Promise<RiskAlert[]>,
    api.analytics.rentOptimization() as Promise<RentOptimization[]>,
  ]);

  return (
    <DashboardClient
      summary={summary}
      properties={properties}
      noiTrend={noiTrend}
      leaseExpiry={leaseExpiry}
      leaseDistribution={leaseDistribution}
      riskAlerts={riskAlerts}
      rentOptimization={rentOptimization}
    />
  );
}
