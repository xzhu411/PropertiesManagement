"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ChevronRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Portfolio", icon: LayoutDashboard },
  { href: "/screening", label: "Tenant Screening", icon: Users },
];

function NavLinks({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
    <nav className="flex-1 px-3 space-y-0.5">
      {nav.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
              active
                ? "bg-[#84cc16]/10 text-[#84cc16] border border-[#84cc16]/20"
                : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent"
            )}
          >
            <Icon size={15} />
            <span className="flex-1 font-medium">{label}</span>
            {active && <ChevronRight size={12} className="opacity-50" />}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const logo = (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-[#84cc16]/20 flex items-center justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-[#84cc16]" />
      </div>
      <div>
        <span className="text-[13px] font-semibold text-slate-100 tracking-tight">Plaza Intelligence</span>
        <p className="text-[10px] text-slate-600 leading-none mt-0.5">Residential AM</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#0a0c12] border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
        {logo}
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="text-slate-400 hover:text-slate-100 transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/60" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute top-0 left-0 bottom-0 w-60 bg-[#0a0c12] border-r border-white/[0.06] flex flex-col pt-16"
            onClick={e => e.stopPropagation()}
          >
            <NavLinks pathname={pathname} onClose={() => setMobileOpen(false)} />
            <div className="px-5 py-5 border-t border-white/[0.06]">
              <p className="text-[11px] text-slate-600">488 units · 4 properties</p>
              <p className="text-[11px] text-slate-700 mt-0.5">Q2 2025</p>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 min-h-screen bg-[#0a0c12] flex-col border-r border-white/[0.06]">
        <div className="px-5 py-7">{logo}</div>
        <NavLinks pathname={pathname} />
        <div className="px-5 py-5 border-t border-white/[0.06]">
          <p className="text-[11px] text-slate-600">488 units · 4 properties</p>
          <p className="text-[11px] text-slate-700 mt-0.5">Q2 2025</p>
        </div>
      </aside>
    </>
  );
}
