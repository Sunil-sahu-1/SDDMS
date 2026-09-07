import Link from "next/link";
import { ShieldCheck, Sparkles, Landmark } from "lucide-react";

export default function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: { href?: string; label: string; icon?: React.ReactNode; onClick?: () => void } }) {
  return (
    <div className="page-hero p-5 sm:p-6 lg:p-7">
      <div className="absolute right-5 top-5 hidden items-center gap-3 opacity-70 sm:flex"><div className="ashoka-chakra"/><div className="text-right"><p className="text-[9px] font-black uppercase tracking-[.16em] text-navy">Government Digital Service</p><p className="text-[9px] text-slate-400">Secure • Transparent • Accountable</p></div></div>
      <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <div className="section-kicker text-[10px] font-extrabold uppercase tracking-[.2em] text-orange-600">{eyebrow || "Secure Government Workspace"}</div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-.035em] text-slate-950 sm:text-4xl">{title}</h1>
          {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-[15px]">{description}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-400"><span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50/70 px-2.5 py-1 text-emerald-700"><ShieldCheck size={12}/> Protected records</span><span className="inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-orange-50/70 px-2.5 py-1 text-orange-700"><Landmark size={12}/> Government service</span><span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50/70 px-2.5 py-1 text-blue-700"><Sparkles size={12}/> Digital India ready</span></div>
        </div>
        {action && (action.href ? <Link href={action.href} className="btn-primary shrink-0">{action.icon}{action.label}</Link> : <button onClick={action.onClick} className="btn-primary shrink-0">{action.icon}{action.label}</button>)}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 tricolor-strip opacity-90"/><div className="absolute -bottom-16 right-32 hidden h-28 w-28 rounded-full border border-blue-100/60 sm:block"/>
    </div>
  );
}
