"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  streamUrl: string | null;
  application: unknown;
  onDone?: () => void;
}

export default function AgentNarrative({ streamUrl, application, onDone }: Props) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!streamUrl || !application) return;

    setText("");
    setDone(false);
    setStreaming(true);

    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(streamUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(application),
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
              onDone?.();
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.chunk) {
                setText((prev) => prev + parsed.chunk);
              }
            } catch {}
          }
        }
      } catch (e: unknown) {
        if ((e as Error).name !== "AbortError") {
          setText((prev) => prev + "\n\n[Connection error — check backend]");
          setStreaming(false);
        }
      }
    })();

    return () => controller.abort();
  }, [streamUrl, application, onDone]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [text]);

  return (
    <div className="bg-[#080a10] border border-white/[0.08] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#84cc16]/60" />
        </div>
        <span className="text-[11px] text-slate-500 font-mono">plaza-intelligence · underwriting-agent</span>
        {streaming && (
          <span className="ml-auto text-[10px] text-[#84cc16] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16] animate-pulse" />
            Analyzing
          </span>
        )}
        {done && (
          <span className="ml-auto text-[10px] text-slate-500">Analysis complete</span>
        )}
      </div>

      <div
        ref={containerRef}
        className="terminal overflow-y-auto max-h-72 whitespace-pre-wrap"
      >
        {text || (
          <span className="text-slate-700">
            {streamUrl ? "Initializing analysis..." : "Submit an application to begin."}
          </span>
        )}
        {streaming && <span className="cursor-blink">█</span>}
      </div>
    </div>
  );
}
