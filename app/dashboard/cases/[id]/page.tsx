"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  UserRound,
  XCircle,
} from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { casesApi } from "@/services/api";
import { pick, statusTone, dateLabel } from "@/lib/format";

type CaseData = Record<string, any>;
type HistoryItem = Record<string, any>;

const STATUS_OPTIONS = [
  "OPEN",
  "UNDER_INVESTIGATION",
  "CHARGESHEET_FILED",
  "COURT",
  "CLOSED",
];

export default function CaseDetails() {
  const params = useParams();
  const router = useRouter();

  const id = String(params.id);

  const [caseData, setCaseData] =
    useState<CaseData | null>(null);

  const [history, setHistory] =
    useState<HistoryItem[]>([]);

  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCase = async () => {
    setLoading(true);
    setError("");

    try {
      const response: any =
        await casesApi.get(id);

      const data =
        response?.data ?? response;

      setCaseData(data);
      setStatus(data?.status ?? "");
    } catch (err) {
      console.error(
        "Failed to load case:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load case.",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const response: any =
        await casesApi.history(id);

      const data =
        response?.data ?? response;

      setHistory(
        Array.isArray(data)
          ? data
          : [],
      );
    } catch (err) {
      console.error(
        "Failed to load case history:",
        err,
      );

      setHistory([]);
    }
  };

  useEffect(() => {
    loadCase();
    loadHistory();
  }, [id]);

  const updateStatus = async () => {
    if (!status) {
      setError(
        "Please select a status.",
      );
      return;
    }

    if (
      status === caseData?.status
    ) {
      setError(
        "Please select a different status.",
      );
      return;
    }

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const response: any =
        await casesApi.updateStatus(
          id,
          status,
          comment,
        );

      const updated =
        response?.data ?? response;

      setCaseData(updated);
      setComment("");

      setSuccess(
        response?.message ||
          "Case status updated successfully.",
      );

      await loadCase();
      await loadHistory();
    } catch (err) {
      console.error(
        "Failed to update case:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update case status.",
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <PageHeader
          eyebrow="Investigation workspace"
          title="Case details"
          description="Loading case information..."
        />

        <div className="card p-10 text-center text-sm text-slate-500">
          Loading case...
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="space-y-5">
        <PageHeader
          eyebrow="Investigation workspace"
          title="Case not found"
          description="The requested case could not be loaded."
        />

        <div className="card p-8 text-center">
          <p className="text-slate-600">
            {error ||
              "Case information is unavailable."}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/cases",
              )
            }
            className="btn-primary mt-5"
          >
            Back to cases
          </button>
        </div>
      </div>
    );
  }

  const caseNumber = pick(
    caseData,
    "case_number",
    "number",
    "id",
  );

  const title = pick(
    caseData,
    "title",
    "name",
  );

  const description = pick(
    caseData,
    "description",
  );

  const currentStatus = pick(
    caseData,
    "status",
  );

  const complainant =
    caseData.complainant;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Investigation workspace"
        title="Case details"
        description="Review case information, history and lifecycle status."
        action={{
          label: "Back to cases",
          icon: <ArrowLeft size={17} />,
          href: "/dashboard/cases",
        }}
      />

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-start gap-3">
            <XCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Operation failed
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} />

            <span>{success}</span>
          </div>
        </div>
      )}

      {/* Case header */}
      <section className="card p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
              <FileText size={24} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Case
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {caseNumber}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {title}
              </p>
            </div>
          </div>

          <span
            className={statusTone(
              currentStatus,
            )}
          >
            {currentStatus}
          </span>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Case information */}
        <section className="card p-6 lg:col-span-2">
          <div className="flex items-center gap-2">
            <FileText
              size={19}
              className="text-slate-500"
            />

            <h2 className="font-semibold text-slate-900">
              Case information
            </h2>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Title
            </p>

            <p className="mt-2 font-medium text-slate-900">
              {title || "—"}
            </p>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Description
            </p>

            <div className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              {description ||
                "No description provided."}
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                FIR number
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {pick(
                  caseData,
                  "fir_number",
                )}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Created
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {dateLabel(
                  caseData.created_at,
                )}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Last updated
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {dateLabel(
                  caseData.updated_at,
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Case personnel */}
        <section className="card p-6">
          <div className="flex items-center gap-2">
            <UserRound
              size={19}
              className="text-slate-500"
            />

            <h2 className="font-semibold text-slate-900">
              Case personnel
            </h2>
          </div>

          <div className="mt-5 space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Complainant
              </p>

              <p className="mt-1 text-sm font-medium text-slate-800">
                {typeof complainant ===
                "object"
                  ? pick(
                      complainant,
                      "full_name",
                      "name",
                      "username",
                    )
                  : pick(
                      caseData,
                      "complainant_username",
                    )}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Assigned officer
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {pick(
                  caseData,
                  "assigned_officer_username",
                  "assigned_officer",
                )}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Investigator
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {pick(
                  caseData,
                  "assigned_investigator_username",
                  "assigned_investigator",
                )}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Created by
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {pick(
                  caseData,
                  "created_by_username",
                  "created_by",
                )}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Status management */}
      <section className="card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Case workflow
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update the case lifecycle status and
              record a comment.
            </p>
          </div>

          <RefreshCw
            size={19}
            className="text-slate-400"
          />
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div>
            <label className="label">
              New status
            </label>

            <select
              className="input"
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value,
                )
              }
              disabled={updating}
            >
              <option value="">
                Select status
              </option>

              {STATUS_OPTIONS.map(
                (option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label className="label">
              Status comment
            </label>

            <textarea
              className="input min-h-28"
              value={comment}
              onChange={(event) =>
                setComment(
                  event.target.value,
                )
              }
              disabled={updating}
              placeholder="Add a note about this status change..."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={updateStatus}
            disabled={
              updating ||
              !status ||
              status === currentStatus
            }
            className="btn-primary"
          >
            {updating
              ? "Updating..."
              : "Update case status"}
          </button>
        </div>
      </section>

      {/* Case history */}
      <section className="card p-6">
        <div className="flex items-center gap-2">
          <Clock3
            size={19}
            className="text-slate-500"
          />

          <h2 className="font-semibold text-slate-900">
            Case history
          </h2>
        </div>

        {history.length === 0 ? (
          <div className="mt-5 rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">
            No case history is available.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {history.map(
              (item, index) => (
                <div
                  key={String(
                    item.id ??
                      index,
                  )}
                  className="relative border-l-2 border-slate-200 pl-5"
                >
                  <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-slate-400" />

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {pick(
                          item,
                          "new_status",
                        )}
                      </p>

                      {pick(
                        item,
                        "old_status",
                      ) !== "—" && (
                        <p className="mt-1 text-xs text-slate-400">
                          Previous status:{" "}
                          {pick(
                            item,
                            "old_status",
                          )}
                        </p>
                      )}

                      <p className="mt-1 text-sm text-slate-600">
                        {pick(
                          item,
                          "comment",
                        )}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Changed by{" "}
                        {pick(
                          item,
                          "changed_by_username",
                          "changed_by",
                        )}
                      </p>
                    </div>

                    <p className="text-xs text-slate-400">
                      {dateLabel(
                        item.created_at,
                      )}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}