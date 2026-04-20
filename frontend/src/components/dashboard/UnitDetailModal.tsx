"use client";

import { useState } from "react";
import { LeaseExpiry } from "@/lib/types";
import { X, Phone, Mail, RefreshCw, Flag, MessageSquare, ChevronDown } from "lucide-react";

interface Props {
  lease: LeaseExpiry | null;
  onClose: () => void;
}

type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

const priorityConfig: Record<Priority, { label: string; color: string; bg: string; border: string }> = {
  CRITICAL: { label: "Critical", color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/30" },
  HIGH:     { label: "High",     color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/30" },
  MEDIUM:   { label: "Medium",   color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  LOW:      { label: "Low",      color: "text-[#84cc16]",  bg: "bg-[#84cc16]/10",  border: "border-[#84cc16]/30" },
};

const MOCK_COMMENTS = [
  { author: "J. Kim (AM)", date: "Apr 15", text: "Left voicemail, no callback. Will retry Apr 22." },
  { author: "System", date: "Apr 10", text: "Automated renewal notice sent via email." },
];

const statusColor: Record<string, string> = {
  "Signed renewal": "text-[#84cc16] bg-[#84cc16]/10 border-[#84cc16]/30",
  "In negotiation": "text-amber-400 bg-amber-500/10 border-amber-500/30",
  "No response": "text-red-400 bg-red-500/10 border-red-500/30",
};

export default function UnitDetailModal({ lease, onClose }: Props) {
  const [priority, setPriority] = useState<Priority>(lease?.urgency ?? "MEDIUM");
  const [flagged, setFlagged] = useState(lease?.urgency === "CRITICAL" || lease?.urgency === "HIGH");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);

  if (!lease) return null;

  const p = priorityConfig[priority];
  const vacancyCost = lease.rent + 800 + 2000;

  const submitComment = () => {
    if (!comment.trim()) return;
    setComments(prev => [{ author: "You (AM)", date: "Now", text: comment.trim() }, ...prev]);
    setComment("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-[#13161f] border border-white/[0.07] rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#13161f] border-b border-white/[0.07] px-5 py-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-100">Unit {lease.unit}</h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusColor[lease.renewal_status] ?? "text-slate-500 bg-[#1a1e2a] border-white/[0.07]"}`}>
                {lease.renewal_status}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">{lease.property} · ${lease.rent.toLocaleString()}/mo · expires {lease.expires}</p>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-300 transition-colors p-1 ml-4 shrink-0">
            <X size={14} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Tenant info */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#1a1e2a] border border-white/[0.07] rounded-lg p-3">
              <p className="text-slate-600 mb-1">Tenant</p>
              <p className="text-slate-100 font-medium">{lease.tenant}</p>
            </div>
            <div className="bg-[#1a1e2a] border border-white/[0.07] rounded-lg p-3">
              <p className="text-slate-600 mb-1">Days until expiry</p>
              <p className={`font-medium ${lease.days_until <= 14 ? "text-red-400" : lease.days_until <= 30 ? "text-amber-400" : "text-slate-100"}`}>
                {lease.days_until} days ({lease.expires})
              </p>
            </div>
            <div className="bg-[#1a1e2a] border border-white/[0.07] rounded-lg p-3">
              <p className="text-slate-600 mb-1">Monthly rent</p>
              <p className="text-slate-100 font-medium">${lease.rent.toLocaleString()}</p>
            </div>
            <div className="bg-[#1a1e2a] border border-white/[0.07] rounded-lg p-3">
              <p className="text-slate-600 mb-1">Vacancy cost if lost</p>
              <p className="text-amber-400 font-medium">${vacancyCost.toLocaleString()}</p>
            </div>
          </div>

          {/* Priority + Flag controls */}
          <div className="flex items-center gap-3">
            {/* Priority selector */}
            <div className="relative flex-1">
              <button
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium ${p.color} ${p.bg} ${p.border}`}
                onClick={() => setShowPriorityMenu(v => !v)}
              >
                <span>Priority: {p.label}</span>
                <ChevronDown size={11} />
              </button>
              {showPriorityMenu && (
                <div className="absolute top-full left-0 mt-1 w-full bg-[#1a1e2a] border border-white/[0.07] rounded-lg shadow-lg z-10 overflow-hidden">
                  {(Object.keys(priorityConfig) as Priority[]).map(key => {
                    const cfg = priorityConfig[key];
                    return (
                      <button
                        key={key}
                        className={`w-full text-left px-3 py-2 text-xs font-medium ${cfg.color} hover:bg-white/[0.06] transition-colors`}
                        onClick={() => { setPriority(key); setShowPriorityMenu(false); }}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Flag toggle */}
            <button
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                flagged
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-[#1a1e2a] border-white/[0.07] text-slate-500 hover:border-red-500/30 hover:text-red-400"
              }`}
              onClick={() => setFlagged(v => !v)}
            >
              <Flag size={11} />
              {flagged ? "Flagged" : "Flag unit"}
            </button>
          </div>

          {/* Action buttons */}
          <div>
            <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">Actions</p>
            <div className="flex flex-wrap gap-2">
              <a
                href={`tel:+15550001234`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.07] text-slate-400 text-xs hover:border-[#84cc16]/40 hover:text-[#84cc16] transition-colors"
              >
                <Phone size={10} /> Call tenant
              </a>
              <a
                href={`mailto:tenant+${lease.unit.toLowerCase()}@example.com`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.07] text-slate-400 text-xs hover:border-[#84cc16]/40 hover:text-[#84cc16] transition-colors"
              >
                <Mail size={10} /> Send notice
              </a>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.07] text-slate-400 text-xs hover:border-amber-400/40 hover:text-amber-400 transition-colors">
                <RefreshCw size={10} /> Offer renewal
              </button>
              <a
                href="/screening"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.07] text-slate-400 text-xs hover:border-[#84cc16]/40 hover:text-[#84cc16] transition-colors"
              >
                Screen replacement →
              </a>
            </div>
          </div>

          {/* Comments */}
          <div>
            <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MessageSquare size={10} /> Notes & Comments
            </p>

            {/* Add comment */}
            <div className="flex gap-2 mb-3">
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Add a note..."
                rows={2}
                className="flex-1 text-xs border border-white/[0.07] rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-[#84cc16]/50 text-slate-300 placeholder-slate-700 bg-[#1a1e2a]"
              />
              <button
                onClick={submitComment}
                disabled={!comment.trim()}
                className="px-3 py-1.5 rounded-lg bg-[#84cc16] text-black text-xs font-medium disabled:opacity-40 hover:bg-[#74b816] transition-colors self-start mt-0.5"
              >
                Add
              </button>
            </div>

            {/* Comment list */}
            <div className="space-y-2">
              {comments.map((c, i) => (
                <div key={i} className="bg-[#1a1e2a] border border-white/[0.06] rounded-lg px-3 py-2.5 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-300">{c.author}</span>
                    <span className="text-slate-600">{c.date}</span>
                  </div>
                  <p className="text-slate-400">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
