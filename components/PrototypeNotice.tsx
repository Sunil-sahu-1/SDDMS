"use client";

import { useEffect, useState } from "react";
import { Info, X } from "lucide-react";

const STORAGE_KEY = "sddms_prototype_notice_seen";

export default function PrototypeNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = window.sessionStorage.getItem(STORAGE_KEY);
    if (!seen) setOpen(true);
  }, []);

  const close = () => {
    window.sessionStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="h-1.5 bg-gradient-to-r from-orange-500 via-white to-green-600" />

        <div className="p-6">
          <div className="mb-5 flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Info size={25} />
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close prototype notice"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={20} />
            </button>
          </div>

          <h2 className="text-2xl font-bold text-slate-900">
            Prototype Demonstration
          </h2>

          <p className="mt-3 leading-6 text-slate-600">
            This Secure Digital Document Management System is currently a
            prototype developed for demonstration and evaluation purposes.
          </p>

          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-5 text-amber-900">
            Some features, data, integrations, and services may be limited,
            simulated, or unavailable in this prototype.
          </div>

          <button
            type="button"
            onClick={close}
            className="mt-6 w-full rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
          >
            Continue to Prototype
          </button>
        </div>
      </div>
    </div>
  );
}
