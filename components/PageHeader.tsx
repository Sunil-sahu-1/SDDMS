import Link from "next/link";
import { ShieldCheck, Sparkles, Landmark, Shield, FileCheck2 } from "lucide-react";

export default function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: { href?: string; label: string; icon?: React.ReactNode; onClick?: () => void } }) {
  return (
    <section className="page-hero relative isolate overflow-hidden rounded-[24px] border border-slate-200 bg-gradient-to-br from-white via-blue-50/70 to-emerald-50/80 p-5 shadow-[0_16px_45px_rgba(15,23,42,.07)] sm:p-6 lg:p-7">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#ff7900_0_33.33%,#ffffff_33.33%_66.66%,#078b45_66.66%)]" />
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-orange-200/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-24 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="pointer-events-none absolute right-8 top-10 hidden h-40 w-40 rounded-full border-[18px] border-blue-600/5 sm:block" />
      <div className="pointer-events-none absolute right-[92px] top-[75px] hidden h-20 w-20 rounded-full border-2 border-blue-600/10 sm:block" />

      <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.18em] text-orange-700">
              <Landmark size={12} /> {eyebrow || "Secure Government Workspace"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white/80 px-2 py-1 text-[9px] font-bold text-emerald-700">
              <ShieldCheck size={11} /> Protected
            </span>
          </div>

          <h1 className="mt-1 text-3xl font-black tracking-[-.04em] text-[#071a41] sm:text-4xl lg:text-[42px]">{title}</h1>
          {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-[15px]">{description}</p>}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50/80 px-3 py-1.5 text-[10px] font-bold text-emerald-700"><ShieldCheck size={12} /> Secure records</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1.5 text-[10px] font-bold text-blue-700"><FileCheck2 size={12} /> Digitally managed</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50/80 px-3 py-1.5 text-[10px] font-bold text-orange-700"><Sparkles size={12} /> Digital India ready</span>
          </div>
        </div>

        <div className="relative z-10 flex shrink-0 flex-col items-start gap-3 sm:items-end">
          <div className="hidden items-center gap-3 rounded-2xl border border-white/80 bg-white/70 px-3 py-2 shadow-sm backdrop-blur sm:flex">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-50 to-white text-[#1457d9]"><Shield size={20} /></div>
            <div><p className="text-[9px] font-black uppercase tracking-[.16em] text-[#071a41]">Government Digital Service</p><p className="mt-0.5 text-[9px] text-slate-400">Secure • Transparent • Accountable</p></div>
          </div>
          {action && (action.href ? <Link href={action.href} className="btn-primary shadow-lg shadow-blue-900/10">{action.icon}{action.label}</Link> : <button onClick={action.onClick} className="btn-primary shadow-lg shadow-blue-900/10">{action.icon}{action.label}</button>)}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[linear-gradient(90deg,#ff7900_0_33.33%,#ffffff_33.33%_66.66%,#078b45_66.66%)] opacity-90" />
    </section>
  );
}
