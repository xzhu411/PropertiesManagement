import { api, API_BASE } from "@/lib/api";
import { ApplicantPreset } from "@/lib/types";
import ScreeningClient from "./ScreeningClient";

export const dynamic = "force-dynamic";

export default async function ScreeningPage() {
  const presets = await api.screening.presets() as ApplicantPreset[];
  const streamBase = API_BASE;

  return (
    <div className="p-4 md:p-6 flex flex-col min-h-screen md:h-screen md:max-h-screen overflow-auto md:overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-white">Tenant Screening</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            AI-powered underwriting · FHA compliance monitoring · 12-month NPV analysis
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-neutral-600">
          <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16]" />
          Claude claude-sonnet-4-6 · Two-call architecture
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <ScreeningClient presets={presets} streamBase={streamBase} />
      </div>
    </div>
  );
}
