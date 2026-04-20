"use client";

import { useEffect, useRef, useState } from "react";
import { X, Copy, Check } from "lucide-react";
import { RiskAlert } from "@/lib/types";
import { API_BASE } from "@/lib/api";

interface Props {
  alert: RiskAlert | null;
  onClose: () => void;
}

export default function DraftNoticeModal({ alert, onClose }: Props) {
  const [text, setText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!alert) return;
    setText("");
    setDone(false);
    setStreaming(true);

    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/portfolio/draft-notice`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(alert),
          signal: controller.signal,
        });

        if (!res.body) return;
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done: readerDone, value } = await reader.read();
          if (readerDone) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") {
              setDone(true);
              setStreaming(false);
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.chunk) setText((prev) => prev + parsed.chunk);
            } catch {}
          }
        }
      } catch (e: unknown) {
        if ((e as Error).name !== "AbortError") setStreaming(false);
      }
    })();

    return () => controller.abort();
  }, [alert]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [text]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!alert) return null;

  const levelColor =
    alert.level === "URGENT" ? "text-red-400" : "text-amber-400";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-[#13161f] border border-white/[0.07] rounded-xl w-full max-w-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Draft Notice
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
              <span className={`font-bold ${levelColor}`}>
                [{alert.level}]
              </span>{" "}
              {alert.property}
              {alert.unit ? ` · Unit ${alert.unit}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {done && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#84cc16]/10 border border-[#84cc16]/30 text-[#84cc16] text-xs hover:bg-[#84cc16]/20 transition-colors"
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-600 hover:text-slate-100 transition-colors p-1"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Terminal body */}
        <div className="p-5">
          <div className="bg-[#080a10] border border-white/[0.08] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#84cc16]/60" />
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                plaza-intelligence · notice-drafting-agent
              </span>
              {streaming && (
                <span className="ml-auto text-[10px] text-[#84cc16] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16] animate-pulse" />
                  Drafting
                </span>
              )}
              {done && (
                <span className="ml-auto text-[10px] text-slate-500">
                  Ready to send
                </span>
              )}
            </div>

            <div
              ref={containerRef}
              className="terminal overflow-y-auto max-h-96 whitespace-pre-wrap text-sm leading-relaxed"
            >
              {text || (
                <span className="text-slate-700">
                  Initializing notice drafting agent...
                </span>
              )}
              {streaming && <span className="cursor-blink">█</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
