"use client";

import { useState } from "react";
import { LeaseExpiry } from "@/lib/types";
import UnitDetailModal from "./UnitDetailModal";
import { shortenPropertyName } from "@/lib/utils";

const urgencyConfig = {
  CRITICAL: { dot: "bg-red-500",    text: "text-red-500",    label: "CRITICAL" },
  HIGH:     { dot: "bg-amber-500",  text: "text-amber-500",  label: "HIGH" },
  MEDIUM:   { dot: "bg-yellow-500", text: "text-yellow-600", label: "MEDIUM" },
  LOW:      { dot: "bg-[#84cc16]",  text: "text-[#84cc16]",  label: "LOW" },
};

const renewalStatusColor: Record<string, string> = {
  "Signed renewal": "text-[#84cc16]",
  "In negotiation": "text-amber-500",
  "No response":    "text-red-500",
};

interface Props {
  leases: LeaseExpiry[];
}

export default function LeaseExpiryTable({ leases }: Props) {
  const [selectedLease, setSelectedLease] = useState<LeaseExpiry | null>(null);

  return (
    <>
      <div className="bg-[#13161f] border border-white/[0.07] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-100">Upcoming Lease Expirations</h3>
          <span className="text-[10px] text-slate-600">Click a row for unit detail</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-600 border-b border-white/[0.07]">
                <th className="text-left pb-2 pr-4 font-normal">Unit</th>
                <th className="text-left pb-2 pr-4 font-normal">Property</th>
                <th className="text-left pb-2 pr-4 font-normal">Tenant</th>
                <th className="text-right pb-2 pr-4 font-normal">Rent</th>
                <th className="text-left pb-2 pr-4 font-normal">Expires</th>
                <th className="text-left pb-2 pr-4 font-normal">Status</th>
                <th className="text-left pb-2 font-normal">Urgency</th>
              </tr>
            </thead>
            <tbody>
              {leases.map((l, i) => {
                const u = urgencyConfig[l.urgency];
                const statusColor = renewalStatusColor[l.renewal_status] ?? "text-slate-400";
                return (
                  <tr
                    key={i}
                    className="border-b border-white/[0.06] hover:bg-white/[0.03] transition-colors cursor-pointer"
                    onClick={() => setSelectedLease(l)}
                  >
                    <td className="py-2.5 pr-4 text-slate-300 font-mono font-medium">{l.unit}</td>
                    <td className="py-2.5 pr-4 text-slate-500">{shortenPropertyName(l.property)}</td>
                    <td className="py-2.5 pr-4 text-slate-300">{l.tenant}</td>
                    <td className="py-2.5 pr-4 text-right text-slate-100 font-medium">${l.rent.toLocaleString()}</td>
                    <td className="py-2.5 pr-4 text-slate-500">
                      {l.expires} <span className="text-slate-600">({l.days_until}d)</span>
                    </td>
                    <td className={`py-2.5 pr-4 ${statusColor}`}>{l.renewal_status}</td>
                    <td className="py-2.5">
                      <span className={`flex items-center gap-1.5 ${u.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.dot}`} />
                        {u.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <UnitDetailModal lease={selectedLease} onClose={() => setSelectedLease(null)} />
    </>
  );
}
