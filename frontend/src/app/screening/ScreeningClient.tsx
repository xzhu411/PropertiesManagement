"use client";

import { useState, useCallback, useRef } from "react";
import { ApplicantPreset, ScreeningResult, TenantApplication } from "@/lib/types";
import PresetApplicantPicker from "@/components/screening/PresetApplicantPicker";
import IncomeRatioGauge from "@/components/screening/IncomeRatioGauge";
import RiskFlagList from "@/components/screening/RiskFlagList";
import FHACompliancePanel from "@/components/screening/FHACompliancePanel";
import NPVImpactModel from "@/components/screening/NPVImpactModel";
import AgentNarrative from "@/components/screening/AgentNarrative";

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CacheEntry {
  result: ScreeningResult;
  streamUrl: string;
  streamApp: unknown;
  timestamp: number;
}

const REC_CONFIG = {
  APPROVED: { color: "text-[#84cc16]", bg: "bg-[#84cc16]/10", border: "border-[#84cc16]/30" },
  CONDITIONAL: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  DENIED: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
};

interface Props {
  presets: ApplicantPreset[];
  streamBase: string;
}

function ConditionsChecklist({ result }: { result: ScreeningResult }) {
  const cfg = REC_CONFIG[result.recommendation];
  const [resolved, setResolved] = useState<Set<number>>(new Set());

  const toggle = (i: number) =>
    setResolved(prev => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; });

  const conditions = result.conditions ?? [];
  const resolvedCount = resolved.size;
  const total = conditions.length;

  return (
    <div className={`border ${cfg.border} ${cfg.bg} rounded-xl p-5`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-2xl font-bold ${cfg.color}`}>{result.recommendation}</p>
          <p className="text-sm text-slate-400 mt-0.5">{result.summary_headline}</p>
        </div>
        <div className="text-right">
          <p className={`text-lg font-semibold ${cfg.color}`}>
            {(result.confidence_score * 100).toFixed(0)}%
          </p>
          <p className="text-[10px] text-slate-600">confidence</p>
        </div>
      </div>

      {total > 0 && (
        <div className="mt-4 pt-4 border-t border-white/[0.07]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-500 uppercase tracking-wider">
              Approval Conditions
            </p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
              resolvedCount === total
                ? "text-[#84cc16] bg-[#84cc16]/10 border-[#84cc16]/30"
                : "text-slate-500 bg-white/[0.04] border-white/[0.08]"
            }`}>
              {resolvedCount}/{total} resolved
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-white/[0.06] rounded-full mb-3 overflow-hidden">
            <div
              className="h-full bg-[#84cc16] rounded-full transition-all duration-300"
              style={{ width: total > 0 ? `${(resolvedCount / total) * 100}%` : "0%" }}
            />
          </div>

          <ul className="space-y-2">
            {conditions.map((c, i) => {
              const done = resolved.has(i);
              return (
                <li key={i} className="flex items-start gap-3 group">
                  <button
                    onClick={() => toggle(i)}
                    className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                      done
                        ? "bg-[#84cc16] border-[#84cc16]"
                        : "border-white/20 bg-white/[0.04] hover:border-[#84cc16]/50"
                    }`}
                  >
                    {done && (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5L3.5 6L8 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                  <span className={`text-sm leading-snug transition-colors ${
                    done ? "text-slate-600 line-through" : "text-slate-300"
                  }`}>
                    {c}
                  </span>
                </li>
              );
            })}
          </ul>

          {resolvedCount === total && total > 0 && (
            <p className="text-xs text-[#84cc16] mt-3 font-medium">
              ✓ All conditions resolved — ready to proceed with approval
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ScreeningClient({ presets, streamBase }: Props) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [application, setApplication] = useState<TenantApplication | null>(null);
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [streamApp, setStreamApp] = useState<unknown>(null);
  const [cachedPresetId, setCachedPresetId] = useState<string | null>(null);

  const cache = useRef<Map<string, CacheEntry>>(new Map());

  const handlePresetSelect = useCallback((preset: ApplicantPreset) => {
    setSelectedPreset(preset.id);
    const app: TenantApplication = {
      name: preset.name,
      monthly_gross_income: preset.monthly_gross_income,
      income_sources: preset.income_sources,
      employment_months: preset.employment_months,
      credit_score_range: preset.credit_score_range,
      rental_history_months: preset.rental_history_months,
      previous_evictions: preset.previous_evictions,
      late_payments_12mo: preset.late_payments_12mo,
      references: preset.references,
      target_unit_rent: preset.target_unit_rent,
      property_id: preset.property_id,
      unit_type: preset.unit_type,
      move_in_date_weeks: preset.move_in_date_weeks,
      pets: preset.pets,
      additional_notes: preset.additional_notes,
    };
    setApplication(app);
    setError(null);

    // Restore from cache if fresh
    const cached = cache.current.get(preset.id);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      setResult(cached.result);
      setStreamUrl(cached.streamUrl);
      setStreamApp(cached.streamApp);
      setCachedPresetId(preset.id);
    } else {
      setResult(null);
      setStreamUrl(null);
      setStreamApp(null);
      setCachedPresetId(null);
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!application || !selectedPreset) return;
    setLoading(true);
    setResult(null);
    setStreamUrl(null);
    setStreamApp(null);
    setError(null);

    try {
      const res = await fetch(`${streamBase}/api/screen-tenant/full`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(application),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      const url = `${streamBase}/api/screen-tenant/stream`;
      setResult(data.structured);
      setStreamUrl(url);
      setStreamApp(application);
      setCachedPresetId(selectedPreset);

      // Store in cache
      cache.current.set(selectedPreset, {
        result: data.structured,
        streamUrl: url,
        streamApp: application,
        timestamp: Date.now(),
      });
    } catch (e: unknown) {
      setError((e as Error).message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  }, [application, selectedPreset, streamBase]);

  const isCached = !!(selectedPreset && cachedPresetId === selectedPreset && result);

  return (
    <div className="flex flex-col md:flex-row gap-5 h-full min-h-0">
      {/* Left panel: preset picker with inline expansion */}
      <div className="w-full md:w-72 md:shrink-0 space-y-3 md:overflow-y-auto">
        <PresetApplicantPicker
          presets={presets}
          selected={selectedPreset}
          application={application}
          loading={loading}
          cached={isCached}
          onSelect={handlePresetSelect}
          onAnalyze={handleAnalyze}
        />

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* Right panel: results */}
      <div className="flex-1 min-w-0 space-y-4 overflow-y-auto">
        {!result && !loading && (
          <div className="flex items-center justify-center h-64 border border-white/[0.07] rounded-xl bg-[#13161f]">
            <div className="text-center">
              <p className="text-slate-500 text-sm">Select a profile and click Analyze</p>
              <p className="text-slate-700 text-xs mt-1">AI-powered underwriting · FHA compliance · NPV analysis</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-64 border border-white/[0.07] rounded-xl bg-[#13161f]">
            <div className="text-center space-y-2">
              <div className="w-6 h-6 border-2 border-[#84cc16] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-500 text-xs">Running structured analysis...</p>
            </div>
          </div>
        )}

        {result && (
          <>
            {/* Recommendation banner */}
            <ConditionsChecklist result={result} />

            {/* Gauge + FHA side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <IncomeRatioGauge
                ratio={result.income_analysis.ratio}
                monthlyGross={result.income_analysis.monthly_gross}
                monthlyRent={result.income_analysis.monthly_rent}
              />
              <FHACompliancePanel compliance={result.fha_compliance} />
            </div>

            {/* NPV Model */}
            <NPVImpactModel npv={result.npv_model} />

            {/* Risk Flags */}
            <RiskFlagList flags={result.risk_flags} />

            {/* Agent Narrative */}
            <AgentNarrative
              streamUrl={streamUrl}
              application={streamApp}
            />
          </>
        )}
      </div>
    </div>
  );
}
