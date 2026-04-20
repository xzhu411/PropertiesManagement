"use client";

interface Props {
  ratio: number;
  monthlyGross: number;
  monthlyRent: number;
}

export default function IncomeRatioGauge({ ratio, monthlyGross, monthlyRent }: Props) {
  const maxRatio = 5;
  const pct = Math.min(ratio / maxRatio, 1);

  const cx = 100, cy = 90, r = 70;
  const startAngle = -180;
  const endAngle = -180 + pct * 180;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startAngle));
  const y1 = cy + r * Math.sin(toRad(startAngle));
  const x2 = cx + r * Math.cos(toRad(endAngle));
  const y2 = cy + r * Math.sin(toRad(endAngle));
  const largeArc = 0;

  const thresholdPct = 3 / maxRatio;
  const thresholdAngle = -180 + thresholdPct * 180;
  const tx = cx + r * Math.cos(toRad(thresholdAngle));
  const ty = cy + r * Math.sin(toRad(thresholdAngle));

  const color = ratio >= 3.0 ? "#84cc16" : ratio >= 2.5 ? "#f59e0b" : "#ef4444";

  return (
    <div className="bg-[#13161f] border border-white/[0.07] rounded-xl p-5">
      <p className="text-[13px] text-slate-500 uppercase tracking-wider mb-3">Income-to-Rent Ratio</p>
      <div className="flex items-center gap-4">
        <svg width="200" height="100" viewBox="0 0 200 100">
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none" stroke="#1e2535" strokeWidth="12" strokeLinecap="round"
          />
          {pct > 0 && (
            <path
              d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
              fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
            />
          )}
          <line
            x1={cx + (r - 8) * Math.cos(toRad(thresholdAngle))}
            y1={cy + (r - 8) * Math.sin(toRad(thresholdAngle))}
            x2={tx} y2={ty}
            stroke="#555" strokeWidth="2"
          />
          <text x={cx} y={cy - 8} textAnchor="middle" fill={color} fontSize="24" fontWeight="600" fontFamily="monospace">
            {ratio.toFixed(2)}x
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fill="#475569" fontSize="11">
            3.0x minimum
          </text>
          <text x={cx - r - 4} y={cy + 16} fill="#374151" fontSize="10">0x</text>
          <text x={cx + r - 8} y={cy + 16} fill="#374151" fontSize="10">5x</text>
        </svg>
        <div className="text-sm space-y-2">
          <div>
            <p className="text-slate-600 text-xs">Gross Income</p>
            <p className="text-slate-100 font-medium">${monthlyGross.toLocaleString()}/mo</p>
          </div>
          <div>
            <p className="text-slate-600 text-xs">Monthly Rent</p>
            <p className="text-slate-100 font-medium">${monthlyRent.toLocaleString()}/mo</p>
          </div>
          <div>
            <p className="text-slate-600 text-xs">Standard</p>
            <p className={`font-medium ${ratio >= 3 ? "text-[#84cc16]" : "text-red-400"}`}>
              {ratio >= 3 ? "✓ Meets 3.0x" : "✗ Below 3.0x"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
