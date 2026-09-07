"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";

import PageHeader from "@/components/PageHeader";
import { casesApi, evidenceApi } from "@/services/api";

type CaseOption = {
  id: number | string;
  case_number?: string;
  fir_number?: string | null;
  title?: string;
};

const EVIDENCE_TYPES = [
  ["DOCUMENT", "Document"],
  ["IMAGE", "Image"],
  ["VIDEO", "Video"],
  ["AUDIO", "Audio"],
  ["PHYSICAL", "Physical"],
  ["OTHER", "Other"],
] as const;

export default function NewEvidencePage() {
  const router = useRouter();
  const [cases, setCases] = useState<CaseOption[]>([]);
  const [caseId, setCaseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceType, setEvidenceType] = useState("DOCUMENT");
  const [file, setFile] = useState<File | null>(null);
  const [loadingCases, setLoadingCases] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    casesApi.list()
      .then((response: any) => {
        const data = Array.isArray(response) ? response : response?.results ?? [];
        setCases(data);
        if (data.length === 0) setError("No accessible cases are available for evidence collection.");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load cases."))
      .finally(() => setLoadingCases(false));
  }, []);

  const submit = async () => {
    setError("");

    if (!file) return setError("Please select an evidence file.");
    if (!caseId) return setError("Please select a case.");
    if (!title.trim()) return setError("Please enter an evidence title.");
    if (file.size > 50 * 1024 * 1024) return setError("Evidence file cannot exceed 50 MB.");

    setBusy(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("case", caseId);
      data.append("title", title.trim());
      data.append("description", description.trim());
      data.append("evidence_type", evidenceType);

      await evidenceApi.upload(data);
      router.push("/dashboard/evidence");
    } catch (err: any) {
      if (err?.data && typeof err.data === "object") {
        const messages = Object.entries(err.data as Record<string, unknown>).map(([field, value]) =>
          `${field}: ${Array.isArray(value) ? value.join(", ") : String(value)}`,
        );
        setError(messages.join(" | ") || err.message || "Evidence upload failed.");
      } else {
        setError(err instanceof Error ? err.message : "Evidence upload failed.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Evidence control"
        title="Add evidence"
        description="Upload an evidence record with case association, integrity hashing and chain-of-custody tracking."
        action={{ href: "/dashboard/evidence", label: "Back to evidence", icon: <ArrowLeft size={17} /> }}
      />

      <section className="card p-5 sm:p-6">
        {error && (
          <div className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Case *</span>
            <select className="input" value={caseId} onChange={(e) => setCaseId(e.target.value)} disabled={loadingCases}>
              <option value="">{loadingCases ? "Loading cases…" : "Select a case"}</option>
              {cases.map((item) => (
                <option key={String(item.id)} value={String(item.id)}>
                  {item.case_number ?? `Case #${item.id}`} — {item.title ?? "Untitled"}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Evidence type *</span>
            <select className="input" value={evidenceType} onChange={(e) => setEvidenceType(e.target.value)}>
              {EVIDENCE_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Title *</span>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. CCTV footage from scene" />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Description</span>
            <textarea className="input min-h-28 resize-y" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the evidence and collection context…" />
          </label>

          <div className="md:col-span-2">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center hover:border-blue-300">
              <UploadCloud className="mb-3 text-blue-600" size={30} />
              <span className="font-semibold text-slate-800">{file ? file.name : "Choose evidence file"}</span>
              <span className="mt-1 text-xs text-slate-500">PDF, DOC, DOCX, TXT, JPG, PNG, video/audio and other supported files · max 50 MB</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const selected = e.target.files?.[0] ?? null;
                  if (selected && selected.size > 50 * 1024 * 1024) {
                    setFile(null);
                    setError("Evidence file cannot exceed 50 MB.");
                    return;
                  }
                  setFile(selected);
                }}
              />
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={() => router.push("/dashboard/evidence")} disabled={busy}>Cancel</button>
          <button type="button" className="btn-primary" onClick={submit} disabled={busy || loadingCases}>
            {busy ? "Uploading…" : "Upload evidence"}
          </button>
        </div>
      </section>
    </div>
  );
}
