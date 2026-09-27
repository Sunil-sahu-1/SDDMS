"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  ChevronRight,
  FileText,
  FolderKanban,
  MessageSquare,
  Search,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";

type Action = {
  label: string;
  description: string;
  href: string;
  icon: typeof FileText;
  keywords: string[];
};

const ACTIONS: Action[] = [
  {
    label: "Open Dashboard",
    description: "View the command dashboard",
    href: "/dashboard",
    icon: ShieldCheck,
    keywords: ["dashboard", "home", "overview"],
  },
  {
    label: "Submit Complaint",
    description: "Create a new complaint",
    href: "/dashboard/complaints/new",
    icon: MessageSquare,
    keywords: ["complaint", "submit", "report"],
  },
  {
    label: "Cases",
    description: "Open case management",
    href: "/dashboard/cases",
    icon: FolderKanban,
    keywords: ["case", "cases", "investigation"],
  },
  {
    label: "Documents",
    description: "Manage secure documents",
    href: "/dashboard/documents",
    icon: FileText,
    keywords: ["document", "documents", "file"],
  },
  {
    label: "Evidence",
    description: "Open evidence management",
    href: "/dashboard/evidence",
    icon: Upload,
    keywords: ["evidence", "upload", "proof"],
  },
  {
    label: "Search",
    description: "Find records quickly",
    href: "/dashboard/search",
    icon: Search,
    keywords: ["search", "find", "lookup"],
  },
];

const normalize = (value: string) => value.trim().toLowerCase();

export default function AssistantBot() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const suggestions = useMemo(() => {
    const q = normalize(query);
    if (!q) return ACTIONS.slice(0, 4);

    const matches = ACTIONS.filter((action) =>
      [action.label, action.description, ...action.keywords].some((value) =>
        normalize(value).includes(q)
      )
    );

    return matches.length ? matches : ACTIONS.slice(0, 4);
  }, [query]);

  const runAction = (action: Action) => {
    setOpen(false);
    setQuery("");
    if (action.href !== pathname) router.push(action.href);
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-[200] w-[min(390px,calc(100vw-24px))] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(7,26,65,.22)] animate-fade-up">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#071a41] via-[#123c82] to-[#1457d9] px-5 pb-5 pt-5 text-white">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute bottom-0 left-1/3 h-1 w-1/3 bg-[#ff7900]" />
            <div className="absolute bottom-0 right-0 h-1 w-1/3 bg-[#078b45]" />

            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-100">
                    SDDMS Assistant
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold">How can I help?</h2>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close assistant"
                onClick={() => setOpen(false)}
                className="rounded-xl p-2 text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="relative mt-3 text-xs leading-5 text-blue-50/90">
              Quickly open the right section or find a common task.
            </p>
          </div>

          <div className="p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && suggestions[0]) {
                    runAction(suggestions[0]);
                  }
                }}
                placeholder="Try “cases”, “documents”, or “complaint”"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <div className="mt-3 space-y-2">
              {suggestions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.href}
                    type="button"
                    onClick={() => runAction(action)}
                    className="group flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-blue-100 hover:bg-blue-50/60 hover:shadow-sm"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-[#1457d9] transition group-hover:bg-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-extrabold text-[#071a41]">
                        {action.label}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                        {action.description}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#1457d9]" />
                  </button>
                );
              })}
            </div>

            {query && !suggestions.length && (
              <p className="py-5 text-center text-xs font-medium text-slate-400">
                No matching task found.
              </p>
            )}

            <p className="mt-3 text-center text-[10px] font-medium text-slate-400">
              Access is still protected by your account permissions.
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        aria-label={open ? "Close SDDMS assistant" : "Open SDDMS assistant"}
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-5 right-5 z-[201] grid h-16 w-16 place-items-center rounded-full border-4 border-white bg-gradient-to-br from-[#071a41] via-[#123c82] to-[#1457d9] text-white shadow-[0_12px_35px_rgba(7,26,65,.28)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(7,26,65,.34)] focus:outline-none focus:ring-4 focus:ring-blue-200"
      >
        <span className="absolute inset-0 rounded-full border-2 border-[#ff7900]/70" />
        {open ? <X className="relative h-6 w-6" /> : <Bot className="relative h-7 w-7" />}
        {!open && (
          <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#078b45]" />
        )}
      </button>
    </>
  );
}
