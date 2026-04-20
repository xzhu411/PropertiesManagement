"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { NOIPoint } from "@/lib/types";
import { fmt } from "@/lib/utils";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1e2a] border border-white/[0.1] rounded-md px-3 py-2 text-xs shadow-sm">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
}

export default function NOIChart({ data }: { data: NOIPoint[] }) {
  return (
    <div className="bg-[#13161f] border border-white/[0.07] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-slate-100">Portfolio NOI Trend</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">12-month actuals vs. budget</p>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-300"><span className="w-3 h-px bg-[#84cc16] inline-block" />Actual</span>
          <span className="flex items-center gap-1.5 text-slate-500"><span className="w-3 h-px bg-slate-500 inline-block" />Budget</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "#475569", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: string) => v.split(" ")[0]}
          />
          <YAxis
            tick={{ fill: "#475569", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={fmt}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={470000} stroke="#2d3347" strokeDasharray="4 4" label={{ value: "Target", fill: "#475569", fontSize: 10 }} />
          <Line
            type="monotone"
            dataKey="noi"
            name="Actual NOI"
            stroke="#84cc16"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#84cc16" }}
          />
          <Line
            type="monotone"
            dataKey="budget"
            name="Budget"
            stroke="#475569"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
