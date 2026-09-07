"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, FolderKanban, FileText, Search, ShieldCheck, Users,
  ClipboardList, Settings, LogOut, Database, BrainCircuit, Scale,
  PackageSearch, MessageSquareWarning, LockKeyhole, UserRoundCheck,
  ChevronRight, Landmark, Flag
} from "lucide-react";
import { authApi } from "@/services/api";

const staffItems = [
  ["/dashboard", "Dashboard", LayoutDashboard],
  ["/dashboard/cases", "Cases", FolderKanban],
  ["/dashboard/documents", "Documents", FileText],
  ["/dashboard/evidence", "Evidence", Database],
  ["/dashboard/investigations", "Investigations", PackageSearch],
  ["/dashboard/complaints", "Complaints", MessageSquareWarning],
  ["/dashboard/legal", "Legal & Court", Scale],
  ["/dashboard/ai", "AI Intelligence", BrainCircuit],
  ["/dashboard/search", "Advanced Search", Search],
  ["/dashboard/audit", "Audit Logs", ClipboardList],
] as const;

const normalItems = [
  ["/dashboard", "My Portal", LayoutDashboard],
  ["/dashboard/complaints", "My Complaints", MessageSquareWarning],
] as const;

export default function Sidebar({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const path = usePathname();
  const [role, setRole] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const raw = localStorage.getItem("sddms_user");
        if (raw) {
          const u = JSON.parse(raw);
          if (mounted) setRole(u?.role || "");
        }
      } catch {}
      try {
        const r: any = await authApi.me();
        const u = r?.data ?? r;
        if (mounted) {
          setRole(u?.role || "");
          localStorage.setItem("sddms_user", JSON.stringify(u));
        }
      } catch {}
    };
    load();
    return () => { mounted = false; };
  }, []);

  const isNormal = role === "NORMAL_USER";
  const items = isNormal ? normalItems : staffItems;

  return (
    <aside className={`${mobile ? "flex w-full" : "hidden w-[270px] lg:flex"} sidebar-shell shrink-0 flex-col border-r border-slate-200/80 bg-white`}>
      <div className="relative overflow-hidden border-b border-slate-100 px-5 pb-4 pt-5">
        <div className="absolute left-0 right-0 top-0 flex h-1.5">
          <span className="w-1/3 bg-[#FF9933]" />
          <span className="w-1/3 bg-white" />
          <span className="w-1/3 bg-[#138808]" />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#071a3d] text-white shadow-lg ring-1 ring-slate-200">
            <Landmark size={27} strokeWidth={1.6} />
            <span className="absolute -bottom-1 rounded bg-white px-1 text-[6px] font-black text-[#071a3d]">INDIA</span>
          </div>
          <div className="min-w-0">
            <p className="text-[18px] font-black tracking-tight text-[#071a3d]">Secure DMS</p>
            <p className="text-[9px] font-extrabold uppercase tracking-[.16em] text-slate-500">Digital Records Portal</p>
            <p className="mt-0.5 text-[8px] font-medium text-slate-400">Law Enforcement & Judicial Use</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 text-[9px] font-bold text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Secure Government Workspace
          <span className="ml-auto text-emerald-400">●</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <p className="section-kicker px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">
          {isNormal ? "Citizen Services" : "Citizen & Officer Services"}
        </p>

        {items.map(([href, label, Icon]) => {
          const active = path === href || path.startsWith(`${href}/`);
          return (
            <Link
              onClick={onNavigate}
              key={href}
              href={href}
              className={`group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all ${active ? "bg-gradient-to-r from-orange-50 via-white to-emerald-50 text-[#071a3d] shadow-sm ring-1 ring-slate-100" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
            >
              {active && <span className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-[#FF9933]" />}
              <Icon size={17} strokeWidth={active ? 2.4 : 2} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="text-[#138808]" />}
            </Link>
          );
        })}

        {!isNormal && (
          <div className="pt-5">
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Administration</p>
            {role === "ADMIN" && (
              <>
                <Link onClick={onNavigate} href="/dashboard/admin" className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all ${path.startsWith("/dashboard/admin") ? "bg-[#071a3d] text-white shadow-lg" : "text-slate-700 hover:bg-slate-50"}`}>
                  <LockKeyhole size={17} />
                  <span className="flex-1">Admin Control Center</span>
                  {path.startsWith("/dashboard/admin") && <ChevronRight size={14} />}
                </Link>
                <Link onClick={onNavigate} href="/dashboard/users" className={`mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all ${path.startsWith("/dashboard/users") ? "bg-emerald-50 text-[#138808]" : "text-slate-600 hover:bg-slate-50"}`}>
                  <Users size={17} />
                  <span>Users & Roles</span>
                </Link>
              </>
            )}
          </div>
        )}

        {isNormal && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-orange-50 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[#138808]"><UserRoundCheck size={17} /><span className="text-xs font-bold">Citizen access</span></div>
            <p className="mt-2 text-xs leading-5 text-slate-500">Only your complaints and their current status are available through this secure portal.</p>
            <div className="mt-3 flex h-1 overflow-hidden rounded-full"><span className="w-1/3 bg-[#FF9933]" /><span className="w-1/3 bg-slate-100" /><span className="w-1/3 bg-[#138808]" /></div>
          </div>
        )}

        {!isNormal && (
          <div className="relative mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-[#071a3d] p-4 text-white shadow-lg">
            <div className="absolute left-0 right-0 top-0 flex h-1"><span className="w-1/3 bg-[#FF9933]" /><span className="w-1/3 bg-white" /><span className="w-1/3 bg-[#138808]" /></div>
            <div className="relative flex items-center gap-2 pt-1"><ShieldCheck size={17} className="text-emerald-300" /><span className="text-xs font-bold">Secure Bharat</span></div>
            <p className="relative mt-2 text-[11px] leading-5 text-blue-100/75">Secure • Transparent • Accountable</p>
          </div>
        )}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <div className="mb-2 flex items-center gap-2 px-3 text-[9px] font-bold uppercase tracking-wider text-slate-400"><Flag size={12} /> Government of India • Secure Portal</div>
        <Link onClick={onNavigate} href="/dashboard/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"><Settings size={17} />Settings</Link>
        <Link onClick={() => { localStorage.removeItem("sddms_access_token"); localStorage.removeItem("sddms_user"); onNavigate?.(); }} href="/login" className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-red-600 transition hover:bg-red-50"><LogOut size={17} />Sign out</Link>
      </div>
    </aside>
  );
}
