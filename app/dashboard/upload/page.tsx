"use client";

import { useEffect, useState } from "react";
import {
  UploadCloud,
  FileText,
  Lock,
  Info,
  BrainCircuit,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

import PageHeader from "@/components/PageHeader";
import { documentsApi, casesApi } from "@/services/api";

type CaseOption = {
  id: number | string;
  case_number?: string;
  fir_number?: string | null;
  title?: string;
};

const DOCUMENT_TYPES = [
  {
    value: "FIR",
    label: "FIR",
  },
  {
    value: "POLICE_REPORT",
    label: "Police Report",
  },
  {
    value: "INVESTIGATION_REPORT",
    label: "Investigation Report",
  },
  {
    value: "LEGAL",
    label: "Legal Document",
  },
  {
    value: "COURT",
    label: "Court Document",
  },
  {
    value: "EVIDENCE",
    label: "Evidence",
  },
  {
    value: "COMPLAINT",
    label: "Complaint Document",
  },
  {
    value: "GENERAL",
    label: "General",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];

export default function Upload() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);

  const [cases, setCases] = useState<CaseOption[]>([]);
  const [caseId, setCaseId] = useState("");

  const [documentType, setDocumentType] =
    useState("GENERAL");

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [loadingCases, setLoadingCases] =
    useState(true);

  const [busy, setBusy] = useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadCases = async () => {
      setLoadingCases(true);
      setError("");

      try {
        const response: any =
          await casesApi.list();

        const data = Array.isArray(response)
          ? response
          : response?.results ?? [];

        setCases(data);

        if (data.length === 0) {
          setError(
            "No cases are available. A document must be associated with an existing case.",
          );
        }
      } catch (err) {
        console.error(
          "Failed to load cases:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load cases.",
        );
      } finally {
        setLoadingCases(false);
      }
    };

    loadCases();
  }, []);

  const handleFile = (selectedFile: File | null) => {
    setError("");
    setMessage("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const maxSize =
      10 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      setFile(null);

      setError(
        "File size cannot exceed 10 MB.",
      );

      return;
    }

    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
      ".txt",
      ".jpg",
      ".jpeg",
      ".png",
    ];

    const lowerName =
      selectedFile.name.toLowerCase();

    const validExtension =
      allowedExtensions.some(
        (extension) =>
          lowerName.endsWith(extension),
      );

    if (!validExtension) {
      setFile(null);

      setError(
        "Unsupported file type. Please upload PDF, DOC, DOCX, TXT, JPG or PNG.",
      );

      return;
    }

    setFile(selectedFile);

    if (!title.trim()) {
      setTitle(
        selectedFile.name.replace(
          /\.[^/.]+$/,
          "",
        ),
      );
    }
  };

  const submit = async () => {
    setError("");
    setMessage("");

    if (!file) {
      setError(
        "Please select a document to upload.",
      );
      return;
    }

    if (!caseId) {
      setError(
        "Please select a case.",
      );
      return;
    }

    if (!title.trim()) {
      setError(
        "Please enter a document title.",
      );
      return;
    }

    setBusy(true);

    try {
      const fd = new FormData();

      fd.append(
        "file",
        file,
      );

      fd.append(
        "title",
        title.trim(),
      );

      fd.append(
        "case",
        caseId,
      );

      fd.append(
        "document_type",
        documentType,
      );

      const response: any =
        await documentsApi.upload(fd);

      console.log(
        "Document upload response:",
        response,
      );

      setMessage(
        "Document uploaded successfully. Integrity processing is handled by the backend.",
      );

      setTimeout(() => {
        router.push(
          "/dashboard/documents",
        );
      }, 900);
    } catch (err: any) {
      console.error(
        "Document upload failed:",
        err,
      );

      let errorMessage =
        "Document upload failed.";

      if (
        err?.data &&
        typeof err.data === "object"
      ) {
        const data = err.data as Record<
          string,
          unknown
        >;

        const messages: string[] = [];

        Object.entries(data).forEach(
          ([field, value]) => {
            if (Array.isArray(value)) {
              messages.push(
                `${field}: ${value.join(", ")}`,
              );
            } else if (
              typeof value === "string"
            ) {
              messages.push(
                `${field}: ${value}`,
              );
            } else {
              messages.push(
                `${field}: ${JSON.stringify(value)}`,
              );
            }
          },
        );

        if (messages.length > 0) {
          errorMessage =
            messages.join(" | ");
        }
      } else if (
        err instanceof Error
      ) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Secure intake"
        title="Upload document"
        description="Create a protected record with metadata, integrity verification and optional AI processing."
      />

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section className="card p-5 sm:p-6">
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() =>
              setDrag(false)
            }
            onDrop={(event) => {
              event.preventDefault();
              setDrag(false);

              handleFile(
                event.dataTransfer
                  .files[0] ?? null,
              );
            }}
            className={`rounded-2xl border-2 border-dashed p-8 text-center transition sm:p-12 ${
              drag
                ? "border-blue-500 bg-blue-50"
                : "border-slate-200 bg-slate-50/60"
            }`}
          >
            <input
              id="file"
              type="file"
              className="hidden"
              onChange={(event) =>
                handleFile(
                  event.target.files?.[0] ??
                    null,
                )
              }
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            />

            <label
              htmlFor="file"
              className="cursor-pointer"
            >
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-blue-600 shadow-sm">
                <UploadCloud size={26} />
              </div>

              <p className="mt-4 font-bold">
                Drop a protected record
                here
              </p>

              <p className="mt-1 text-sm text-slate-500">
                PDF, DOC, DOCX, TXT, JPG
                or PNG • Maximum 10 MB
              </p>

              <span className="mt-5 inline-flex btn-secondary">
                Choose file
              </span>
            </label>

            {file && (
              <div className="mx-auto mt-5 flex max-w-md items-center gap-3 rounded-xl border border-blue-100 bg-white p-3 text-left">
                <FileText
                  className="shrink-0 text-blue-600"
                  size={20}
                />

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {file.name}
                  </p>

                  <p className="text-xs text-slate-400">
                    {(
                      file.size /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">
                Document title
              </label>

              <input
                className="input"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value,
                  )
                }
                placeholder="Enter document title"
              />
            </div>

            <div>
              <label className="label">
                Document type
              </label>

              <select
                className="input"
                value={documentType}
                onChange={(event) =>
                  setDocumentType(
                    event.target.value,
                  )
                }
              >
                {DOCUMENT_TYPES.map(
                  (type) => (
                    <option
                      key={type.value}
                      value={type.value}
                    >
                      {type.label}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="label">
                Case
              </label>

              <select
                className="input"
                value={caseId}
                onChange={(event) =>
                  setCaseId(
                    event.target.value,
                  )
                }
                disabled={
                  loadingCases ||
                  cases.length === 0
                }
              >
                <option value="">
                  {loadingCases
                    ? "Loading cases..."
                    : cases.length === 0
                      ? "No cases available"
                      : "Select a case"}
                </option>

                {cases.map((item) => (
                  <option
                    key={String(item.id)}
                    value={String(item.id)}
                  >
                    {item.case_number ??
                      `Case ${item.id}`}
                    {item.title
                      ? ` — ${item.title}`
                      : ""}
                  </option>
                ))}
              </select>

              <p className="mt-1 text-xs text-slate-400">
                The document must be
                associated with an
                existing case.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="label">
                Description
              </label>

              <textarea
                className="input min-h-24"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
                placeholder="Brief description and handling notes…"
              />

              <p className="mt-1 text-xs text-slate-400">
                Description is kept in
                the upload form for
                record notes.
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle
                className="mt-0.5 shrink-0"
                size={18}
              />

              <div>
                <p className="font-semibold">
                  Document upload failed
                </p>

                <p className="mt-1">
                  {error}
                </p>
              </div>
            </div>
          )}

          {message && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              {message}
            </div>
          )}

          <div className="mt-6 flex flex-col justify-end gap-2 border-t border-slate-100 pt-5 sm:flex-row">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setFile(null);
                setTitle("");
                setCaseId("");
                setDocumentType("GENERAL");
                setDescription("");
                setError("");
                setMessage("");
              }}
              disabled={busy}
            >
              Clear
            </button>

            <button
              type="button"
              onClick={submit}
              disabled={
                !file ||
                !caseId ||
                !title.trim() ||
                busy ||
                loadingCases
              }
              className="btn-primary"
            >
              {busy ? (
                <>
                  <span className="spinner" />
                  Uploading…
                </>
              ) : (
                <>
                  Upload securely
                  <UploadCloud size={17} />
                </>
              )}
            </button>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                <Lock size={18} />
              </div>

              <h3 className="font-bold">
                Secure processing
              </h3>
            </div>

            <div className="mt-5 space-y-4">
              {[
                [
                  "File validation",
                  "Type and size checks",
                ],
                [
                  "Malware scanning",
                  "Backend security pipeline",
                ],
                [
                  "SHA-256 integrity",
                  "Content hash generated",
                ],
                [
                  "Access policy",
                  "Role/object permissions",
                ],
                [
                  "Immutable audit",
                  "Sensitive event recorded",
                ],
              ].map(([a, b], index) => (
                <div
                  className="flex gap-3"
                  key={a}
                >
                  <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold">
                    {index + 1}
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      {a}
                    </p>

                    <p className="text-xs text-slate-400">
                      {b}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
            <div className="flex gap-3">
              <BrainCircuit
                className="mt-0.5 text-violet-600"
                size={18}
              />

              <div>
                <p className="text-sm font-bold text-violet-900">
                  AI-ready intake
                </p>

                <p className="mt-1 text-xs leading-5 text-violet-800">
                  After upload,
                  authorized users can
                  request summarization,
                  entity extraction,
                  classification and
                  assisted legal
                  insights through the
                  AI service.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex gap-3">
              <Info
                className="mt-0.5 text-blue-600"
                size={18}
              />

              <p className="text-xs leading-5 text-blue-800">
                The frontend never
                stores API keys.
                Authentication tokens and
                AI provider secrets belong
                to the backend environment.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}