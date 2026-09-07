"use client";

import { useEffect, useMemo, useState } from "react";
import { BrainCircuit, Download, Eye, Filter, Search, ShieldCheck, UploadCloud } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { documentsApi } from "@/services/api";
import { Loading } from "@/components/Loading";
import { pick, statusTone, dateLabel } from "@/lib/format";

function fileName(row: any) {
  return row?.original_filename || row?.title || `document-${row?.id ?? "file"}`;
}

export default function Documents() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [verified, setVerified] = useState<Record<string, boolean>>({});

  useEffect(() => {
    documentsApi.list()
      .then((r: any) => setRows(Array.isArray(r) ? r : r?.results ?? []))
      .catch((e) => setError(e instanceof Error ? e.message : "Unable to load documents."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q.toLowerCase())),
    [rows, q],
  );

  const openFile = async (row: any) => {
    const key = String(row.id);
    setBusyId(key);
    setError("");
    try {
      const response = await documentsApi.view(row.id);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to view document.");
    } finally {
      setBusyId(null);
    }
  };

  const downloadFile = async (row: any) => {
    const key = String(row.id);
    setBusyId(key);
    setError("");
    try {
      const response = await documentsApi.download(row.id);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName(row);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Document download failed.");
    } finally {
      setBusyId(null);
    }
  };

  const verifyFile = async (row: any) => {
    const key = String(row.id);
    setBusyId(key);
    setError("");
    try {
      const result: any = await documentsApi.verify(row.id);
      const data = result?.data ?? result;
      setVerified((current) => ({ ...current, [key]: data?.integrity_valid === true }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Integrity verification failed.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <PageHeader eyebrow="Records" title="Documents" description="Securely store, retrieve, version and verify sensitive case records." action={{ href: "/dashboard/upload", label: "Upload document", icon: <UploadCloud size={17} /> }} />
      <div className="card p-3 sm:p-4"><div className="flex flex-col gap-2 lg:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><input value={q} onChange={(e) => setQ(e.target.value)} className="input pl-10" placeholder="Search title, FIR, case number, document type…" /></div><button className="btn-secondary"><Filter size={16} /> Filters</button></div></div>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 p-4"><div><p className="font-bold">Protected records</p><p className="text-xs text-slate-400">{filtered.length} records shown</p></div><div className="flex gap-2"><Link href="/dashboard/ai" className="btn-secondary"><BrainCircuit size={16} /> AI analysis</Link></div></div>
        {loading ? <Loading /> : filtered.length === 0 ? <div className="p-10 text-center text-sm text-slate-500">{q ? "No documents match your search." : "No documents have been uploaded yet."}</div> : <div className="table-wrap"><table className="table-base"><thead><tr><th>Document</th><th>Case</th><th>Date</th><th>Integrity</th><th className="text-right">Actions</th></tr></thead><tbody>{filtered.map((r) => { const key = String(r.id); const isVerified = verified[key]; return <tr key={key} className="transition hover:bg-slate-50"><td><p className="font-semibold text-slate-800">{pick(r, "title", "name")}</p><p className="text-xs text-slate-400">{pick(r, "document_type", "type")}</p></td><td>{pick(r, "case_number", "case")}</td><td>{dateLabel(r.created_at)}</td><td><span className={isVerified ? "badge bg-emerald-50 text-emerald-700" : statusTone(pick(r, "integrity_status", "status"))}>{isVerified ? "Verified" : pick(r, "integrity_status", "status")}</span></td><td><div className="flex justify-end gap-1"><button title="View document" disabled={busyId === key} onClick={() => openFile(r)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50"><Eye size={16} /></button><button title="Verify integrity" disabled={busyId === key} onClick={() => verifyFile(r)} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"><ShieldCheck size={16} /></button><button title="Download" disabled={busyId === key} onClick={() => downloadFile(r)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"><Download size={16} /></button></div></td></tr>; })}</tbody></table></div>}
      </section>
    </div>
  );
}
