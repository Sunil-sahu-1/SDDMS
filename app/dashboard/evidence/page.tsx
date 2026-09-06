"use client";

import { useEffect, useMemo, useState } from "react";
import { Database, Download, Plus, Search, ShieldCheck } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { evidenceApi } from "@/services/api";
import { Loading } from "@/components/Loading";
import { pick, dateLabel } from "@/lib/format";

export default function Evidence() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState<Record<string, boolean>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadEvidence = async () => {
    setLoading(true);
    setError("");
    try {
      const response: any = await evidenceApi.list();
      setRows(Array.isArray(response) ? response : response?.results ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load evidence.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvidence();
  }, []);

  const filtered = useMemo(
    () => rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q.toLowerCase())),
    [rows, q],
  );

  const verify = async (id: string | number) => {
    const key = String(id);
    setBusyId(key);
    try {
      const result: any = await evidenceApi.verify(id);
      setVerified((current) => ({ ...current, [key]: result?.integrity_valid === true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Integrity verification failed.");
    } finally {
      setBusyId(null);
    }
  };

  const download = async (row: any) => {
    const key = String(row.id);
    setBusyId(key);
    try {
      const response = await evidenceApi.download(row.id);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = row.original_filename || row.title || `evidence-${row.id}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Evidence download failed.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Evidence control"
        title="Evidence"
        description="Track evidence records, integrity verification and chain-of-custody events."
        action={{ href: "/dashboard/evidence/new", label: "Add evidence", icon: <Plus size={17} /> }}
      />

      <div className="card p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input className="input pl-10" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search evidence, exhibit, case number…" />
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <section className="card overflow-hidden">
        <div className="border-b border-slate-100 p-4">
          <p className="font-bold">Evidence register</p>
          <p className="text-xs text-slate-400">Every sensitive action is recorded by the backend.</p>
        </div>
        {loading ? (
          <div className="p-6"><Loading /></div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">{q ? "No evidence matches your search." : "No evidence has been uploaded yet."}</div>
        ) : (
          <div className="table-wrap">
            <table className="table-base">
              <thead><tr><th>Evidence</th><th>Case</th><th>Type</th><th>Integrity</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((r) => {
                  const key = String(r.id);
                  const isVerified = verified[key];
                  return (
                    <tr key={key}>
                      <td><p className="font-semibold text-slate-800">{pick(r, "evidence_number", "number", "id")}</p><p className="text-xs text-slate-400">{pick(r, "title", "name")}</p></td>
                      <td>{pick(r, "case_number", "case")}</td>
                      <td>{pick(r, "evidence_type", "type")}</td>
                      <td><span className={isVerified ? "badge bg-emerald-50 text-emerald-700" : "badge bg-slate-100 text-slate-600"}>{isVerified ? "Verified" : "Not verified"}</span></td>
                      <td>{dateLabel(r.created_at)}</td>
                      <td>
                        <button className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50" title="Verify integrity" disabled={busyId === key} onClick={() => verify(r.id)}><ShieldCheck size={16} /></button>
                        <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50" title="Download" disabled={busyId === key} onClick={() => download(r)}><Download size={16} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-4"><Database className="text-blue-600" size={18} /><p className="mt-3 text-xl font-bold">{rows.length}</p><p className="text-xs text-slate-500">Evidence items</p></div>
        <div className="card p-4"><ShieldCheck className="text-emerald-600" size={18} /><p className="mt-3 text-xl font-bold">{Object.values(verified).filter(Boolean).length}</p><p className="text-xs text-slate-500">Integrity verified this session</p></div>
        <div className="card p-4"><p className="text-xl font-bold">—</p><p className="text-xs text-slate-500">Custody events today</p></div>
      </div>
    </div>
  );
}
