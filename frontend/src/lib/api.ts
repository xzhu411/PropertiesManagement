export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const BASE = API_BASE;

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export const api = {
  portfolio: {
    summary: () => get("/api/portfolio/summary"),
    properties: () => get("/api/portfolio/properties"),
    noiTrend: () => get("/api/portfolio/noi-trend"),
    leaseExpiry: () => get("/api/portfolio/lease-expiry"),
    leaseExpiryDistribution: () => get("/api/portfolio/lease-expiry-distribution"),
    riskAlerts: () => get("/api/portfolio/risk-alerts"),
  },
  analytics: {
    rentOptimization: (propertyId = "all") =>
      get(`/api/analytics/rent-optimization?property_id=${propertyId}`),
  },
  screening: {
    presets: () => get("/api/applicants/presets"),
    screen: (application: unknown) => post("/api/screen-tenant/full", application),
    streamUrl: () => `${BASE}/api/screen-tenant/stream`,
  },
};
