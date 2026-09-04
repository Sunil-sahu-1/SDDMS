"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  Search,
} from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { complaintsApi } from "@/services/api";
import { pick, statusTone, dateLabel } from "@/lib/format";

type Complaint = Record<string, any>;

export default function Complaints() {
  const [rows, setRows] = useState<Complaint[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadComplaints = async () => {
      setLoading(true);
      setError("");

      try {
        const response: any = await complaintsApi.list();

        if (!mounted) return;

        const data = Array.isArray(response)
          ? response
          : response?.results ?? [];

        setRows(data);
      } catch (err) {
        console.error("Failed to load complaints:", err);

        if (!mounted) return;

        setRows([]);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your complaints.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadComplaints();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredRows = useMemo(() => {
    const search = q.trim().toLowerCase();

    if (!search) return rows;

    return rows.filter((row) =>
      JSON.stringify(row).toLowerCase().includes(search),
    );
  }, [rows, q]);

  const submittedCount = rows.filter(
    (r) => pick(r, "status") === "SUBMITTED",
  ).length;

  const underReviewCount = rows.filter(
    (r) => pick(r, "status") === "UNDER_REVIEW",
  ).length;

  const resolvedCount = rows.filter((r) =>
    ["CLOSED", "REJECTED"].includes(
      pick(r, "status"),
    ),
  ).length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Intake"
        title="My Complaints"
        description="Track the complaints you have submitted and their current status."
        action={{
          label: "Register complaint",
          icon: <Plus size={17} />,
          href: "/dashboard/complaints/new",
        }}
      />

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
              <FileText size={19} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Total complaints
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {rows.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <Clock3 size={19} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Under review
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {submittedCount + underReviewCount}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
              <CheckCircle2 size={19} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Closed / rejected
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {resolvedCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-3">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={17}
          />

          <input
            className="input pl-10"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search complaint number or subject…"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold">
                Unable to load complaints
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Complaints */}
      <section className="card overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Submitted complaints
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Only complaints associated with your account are displayed.
          </p>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading your complaints…
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <FileText size={20} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              {q
                ? "No matching complaints"
                : "No complaints yet"}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {q
                ? "Try a different search term."
                : "Submit your first complaint to start the process."}
            </p>

            {!q && (
              <a
                href="/dashboard/complaints/new"
                className="btn-primary mt-5 inline-flex"
              >
                <Plus size={17} />
                Register complaint
              </a>
            )}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Complaint</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Case</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row) => {
                  const status = pick(
                    row,
                    "status",
                  );

                  const caseNumber =
                    pick(
                      row,
                      "case_number",
                      "case",
                    );

                  return (
                    <tr
                       key={String(row.id)}
                       onClick={() =>
                       window.location.href =
                      `/dashboard/complaints/${row.id}`
                       }
                      className="cursor-pointer hover:bg-slate-50"
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
                            <FileText size={17} />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              {pick(
                                row,
                                "complaint_number",
                                "number",
                                "id",
                              )}
                            </p>

                            <p className="mt-1 max-w-md truncate text-xs text-slate-400">
                              {pick(
                                row,
                                "subject",
                                "title",
                                "description",
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={statusTone(status)}
                        >
                          {status || "UNKNOWN"}
                        </span>
                      </td>

                      <td>
                        {dateLabel(
                          row.created_at,
                        )}
                      </td>

                      <td>
                        {caseNumber ? (
                          <span className="font-medium text-slate-700">
                            {typeof caseNumber ===
                            "object"
                              ? pick(
                                  caseNumber,
                                  "case_number",
                                  "number",
                                  "id",
                                )
                              : caseNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            Not converted
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}