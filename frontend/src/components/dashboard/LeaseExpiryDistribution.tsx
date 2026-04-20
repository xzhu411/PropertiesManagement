"use client";

import { useState } from "react";
import { LeaseExpiryDistributionData } from "@/lib/types";
import { AlertTriangle } from "lucide-react";
import { shortenPropertyName } from "@/lib/utils";

const PROPERTY_COLORS: Record<string, string> = {
  "Sunset Ridge":       "bg-amber-500",
  "Riverside Commons":  "bg-blue-500",
  "Oakwood Apartments": "bg-[#84cc16]",
  "Lincoln Park Tower": "bg-purple-500",
};

const PROPERTY_TEXT: Record<string, string> = {
  "Sunset Ridge":       "text-amber-400",
  "Riverside Commons":  "text-blue-400",
  "Oakwood Apartments": "text-[#84cc16]",
  "Lincoln Park Tower": "text-purple-400",
};

const WINDOWS = [
  { key: "30" as const, label: "30d", sublabel: "Weekly" },
  { key: "60" as const, label: "60d", sublabel: "15-day" },
  { key: "90" as const, label: "90d", sublabel: "Monthly" },
];

export default function LeaseExpiryDistribution({ data }: { data: LeaseExpiryDistributionData }) {
  const [windowKey, setWindowKey] = useState<"30" | "60" | "90">("90");

  const buckets = data[windowKey];
  const grandTotal = buckets.reduce((s, b) => s + b.total, 0);
  const maxTotal = Math.max(...buckets.map(b => b.total), 1);
  const peakBucket = buckets.find(b => b.peak);

  return (
    <div className="bg-[#13161f] border border-white/[0.07] rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-medium text-slate-100">Lease Rollover Concentration</h3>
        <div className="flex items-center gap-0.5 bg-white/[0.04] border border-white/[0.07] rounded-lg p-0.5">
          {WINDOWS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setWindowKey(key)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                windowKey === key
                  ? "bg-[#84cc16] text-black"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-4">
        {grandTotal} units · {WINDOWS.find(w => w.key === windowKey)?.sublabel} buckets
      </p>

      {peakBucket && (
        <div className="flex items-center gap-1.5 mb-4 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <AlertTriangle size={11} className="text-amber-400 shrink-0" />
          <p className="text-xs text-amber-400">
            Peak: <span className="font-medium">{peakBucket.total} units</span> in {peakBucket.label} — highest rollover risk
          </p>
        </div>
      )}

      <div className="space-y-4">
        {buckets.map((bucket) => {
          const widthPct = (bucket.total / maxTotal) * 100;
          const properties = Object.entries(bucket.by_property);

          return (
            <div key={bucket.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-medium flex items-center gap-2 ${bucket.peak ? "text-amber-400" : "text-slate-400"}`}>
                  {bucket.label}
                  {bucket.peak && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">
                      PEAK
                    </span>
                  )}
                </span>
                <span className={`text-sm font-semibold ${bucket.peak ? "text-amber-400" : bucket.total === 0 ? "text-slate-700" : "text-slate-300"}`}>
                  {bucket.total} units
                </span>
              </div>

              <div className="h-6 bg-white/[0.05] rounded-md overflow-hidden">
                {bucket.total > 0 && (
                  <div className="flex h-full transition-all duration-300" style={{ width: `${widthPct}%` }}>
                    {properties.map(([prop, count], i) => (
                      <div
                        key={prop}
                        className={`h-full ${PROPERTY_COLORS[prop] ?? "bg-slate-500"} ${i > 0 ? "border-l border-black/20" : ""}`}
                        style={{ width: `${(count / bucket.total) * 100}%` }}
                        title={`${prop}: ${count} units`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {properties.length > 0 && (
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                  {properties.map(([prop, count]) => (
                    <span key={prop} className={`text-[11px] ${PROPERTY_TEXT[prop] ?? "text-slate-500"}`}>
                      {shortenPropertyName(prop)}: {count}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-white/[0.06]">
        {Object.entries(PROPERTY_COLORS).map(([prop, color]) => (
          <span key={prop} className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className={`w-2 h-2 rounded-sm ${color}`} />
            {shortenPropertyName(prop)}
          </span>
        ))}
      </div>
    </div>
  );
}
