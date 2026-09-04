"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  XCircle,
} from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { apiRequest } from "@/services/api";
import { pick, statusTone, dateLabel } from "@/lib/format";

type Complaint = Record<string, any>;

const STATUS_OPTIONS = [
  "UNDER_REVIEW",
  "ACCEPTED",
  "REJECTED",
  "CLOSED",
];

export default function ComplaintDetails() {
  const params = useParams();
  const router = useRouter();

  const id = String(params.id);

  const [complaint, setComplaint] =
    useState<Complaint | null>(null);

  const [status, setStatus] = useState("");
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadComplaint = async () => {
    setLoading(true);
    setError("");

    try {
      const response: any = await apiRequest(
        `/complaints/${id}/`,
      );

      const data = response?.data ?? response;

      setComplaint(data);
      setStatus(data?.status ?? "");
    } catch (err) {
      console.error(
        "Failed to load complaint:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load complaint.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaint();
  }, [id]);

  const updateStatus = async () => {
    if (!status) {
      setError("Please select a status.");
      return;
    }

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const response: any = await apiRequest(
        `/complaints/${id}/update-status/`,
        {
          method: "POST",
          body: JSON.stringify({
            status,
            comment,
          }),
        },
      );
      const convertToCase = async () => {
  setConverting(true);
  setError("");
  setSuccess("");

  try {
    const response: any = await apiRequest(
      `/complaints/${id}/convert-to-case/`,
      {
        method: "POST",
      },
    );

    const convertedComplaint =
      response?.data?.complaint ??
      response?.complaint;

    setSuccess(
      response?.message ||
        "Complaint converted into case successfully.",
    );

    if (convertedComplaint) {
      setComplaint(convertedComplaint);
      setStatus(convertedComplaint.status ?? "");
    }

    await loadComplaint();
  } catch (err) {
    console.error(
      "Failed to convert complaint:",
      err,
    );

    setError(
      err instanceof Error
        ? err.message
        : "Unable to convert complaint into a case.",
    );
  } finally {
    setConverting(false);
  }
};

      const updated =
        response?.data ?? response;

      setComplaint(updated);
      setComment("");

      setSuccess(
        "Complaint status updated successfully.",
      );

      await loadComplaint();
    } catch (err) {
      console.error(
        "Failed to update complaint:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update complaint.",
      );
    } finally {
      setUpdating(false);
    }
  };
  const convertToCase = async () => {
  setConverting(true);
  setError("");
  setSuccess("");

  try {
    const response: any = await apiRequest(
      `/complaints/${id}/convert-to-case/`,
      {
        method: "POST",
      },
    );

    const convertedComplaint =
      response?.data?.complaint ??
      response?.complaint;

    setSuccess(
      response?.message ||
        "Complaint converted into case successfully.",
    );

    if (convertedComplaint) {
      setComplaint(convertedComplaint);
      setStatus(
        convertedComplaint.status ?? "",
      );
    }

    await loadComplaint();
  } catch (err) {
    console.error(
      "Failed to convert complaint:",
      err,
    );

    setError(
      err instanceof Error
        ? err.message
        : "Unable to convert complaint into a case.",
    );
  } finally {
    setConverting(false);
  }
};

  if (loading) {
    return (
      <div className="space-y-5">
        <PageHeader
          eyebrow="Complaint review"
          title="Complaint details"
          description="Loading complaint information..."
        />

        <div className="card p-10 text-center text-sm text-slate-500">
          Loading complaint...
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="space-y-5">
        <PageHeader
          eyebrow="Complaint review"
          title="Complaint not found"
          description="The requested complaint could not be loaded."
        />

        <div className="card p-8 text-center">
          <p className="text-slate-600">
            {error ||
              "Complaint information is unavailable."}
          </p>

          <button
            onClick={() =>
              router.push(
                "/dashboard/complaints",
              )
            }
            className="btn-primary mt-5"
          >
            Back to complaints
          </button>
        </div>
      </div>
    );
  }

  const complaintNumber = pick(
    complaint,
    "complaint_number",
    "number",
    "id",
  );

  const subject = pick(
    complaint,
    "subject",
    "title",
  );

  const description = pick(
    complaint,
    "description",
    "narrative",
  );

  const currentStatus = pick(
    complaint,
    "status",
  );

  const complainant =
    complaint.complainant;

  const caseData = complaint.case;

  const caseNumber =
    typeof caseData === "object"
      ? pick(
          caseData,
          "case_number",
          "number",
          "id",
        )
      : caseData;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Complaint review"
        title="Complaint details"
        description="Review the complaint and manage its workflow status."
        action={{
          label: "Back to complaints",
          icon: <ArrowLeft size={17} />,
          href: "/dashboard/complaints",
        }}
      />

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

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={18} />

            <span>{success}</span>
          </div>
        </div>
      )}

      {/* Header card */}
      <section className="card p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
              <FileText size={24} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Complaint
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {complaintNumber}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {subject}
              </p>
            </div>
          </div>

          <div>
            <span
              className={statusTone(
                currentStatus,
              )}
            >
              {currentStatus}
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Complaint information */}
        <section className="card p-6 lg:col-span-2">
          <div className="flex items-center gap-2">
            <FileText
              size={19}
              className="text-slate-500"
            />

            <h2 className="font-semibold text-slate-900">
              Complaint information
            </h2>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Subject
            </p>

            <p className="mt-2 font-medium text-slate-900">
              {subject || "—"}
            </p>
          </div>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Narrative
            </p>

            <div className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              {description ||
                "No narrative provided."}
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Created
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {dateLabel(
                  complaint.created_at,
                )}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Last updated
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {dateLabel(
                  complaint.updated_at,
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Complainant */}
        <section className="card p-6">
          <h2 className="font-semibold text-slate-900">
            Complainant
          </h2>

          {complainant ? (
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Name
                </p>

                <p className="mt-1 text-sm font-medium text-slate-800">
                  {pick(
                    complainant,
                    "full_name",
                    "name",
                    "username",
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Username
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {pick(
                    complainant,
                    "username",
                  ) || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Email
                </p>

                <p className="mt-1 break-all text-sm text-slate-700">
                  {pick(
                    complainant,
                    "email",
                  ) || "—"}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-500">
              Complainant information unavailable.
            </p>
          )}
        </section>
      </div>

      {/* Case information */}
<section className="card p-6">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-2">
      <Clock3
        size={19}
        className="text-slate-500"
      />

      <h2 className="font-semibold text-slate-900">
        Case information
      </h2>
    </div>

    {caseNumber && (
      <button
        type="button"
        onClick={() =>
          router.push(
            `/dashboard/cases/${typeof caseData === "object" ? caseData?.id : caseData}`,
          )
        }
        className="btn-primary"
      >
        View Case
      </button>
    )}
  </div>

  <div className="mt-4">
    {caseNumber ? (
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Associated case
        </p>

        <p className="mt-1 font-semibold text-slate-800">
          {caseNumber}
        </p>

        <p className="mt-1 text-sm text-emerald-600">
          This complaint has been converted into a case.
        </p>
      </div>
    ) : complaint.status === "ACCEPTED" ? (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="font-semibold text-slate-800">
          Ready for case conversion
        </p>

        <p className="mt-1 text-sm text-slate-600">
          This complaint has been accepted and can now
          be converted into an investigation case.
        </p>

        <button
          type="button"
          onClick={ convertToCase }
          disabled={converting}
          className="btn-primary mt-4"
        >
          {converting
            ? "Converting..."
            : "Convert to Case"}
        </button>
      </div>
    ) : (
      <p className="text-sm text-slate-500">
        This complaint has not been accepted for
        case conversion yet.
      </p>
    )}
  </div>
</section>
      {/* Status management */}
      <section className="card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Complaint workflow
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update the complaint status and record
              a review comment.
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
              onChange={(e) =>
                setStatus(e.target.value)
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
              Review comment
            </label>

            <textarea
              className="input min-h-28"
              value={comment}
              onChange={(e) =>
                setComment(e.target.value)
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
              : "Update status"}
          </button>
        </div>
      </section>
    </div>
  );
}