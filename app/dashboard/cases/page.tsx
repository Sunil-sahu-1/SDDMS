"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FolderKanban,
  Plus,
  Search,
  Users,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

import PageHeader from "@/components/PageHeader";
import { casesApi } from "@/services/api";
import { Loading } from "@/components/Loading";
import { pick, statusTone, dateLabel } from "@/lib/format";

type CaseRow = {
  id: number | string;
  case_number?: string;
  fir_number?: string | null;
  title?: string;
  description?: string;
  status?: string;
  assigned_officer?: number | string | null;
  assigned_officer_username?: string | null;
  assigned_investigator?: number | string | null;
  assigned_investigator_username?: string | null;
  created_at?: string;
};

export default function Cases() {
  const [rows, setRows] = useState<CaseRow[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    casesApi
      .list()
      .then((response: any) => {
        setRows(
          Array.isArray(response)
            ? response
            : response?.results ?? [],
        );
      })
      .catch((err: any) => {
        setRows([]);
        setError(
          err?.message ||
            "Unable to load cases.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();

    if (!search) {
      return rows;
    }

    return rows.filter((row) =>
      [
        row.case_number,
        row.fir_number,
        row.title,
        row.status,
        row.assigned_officer_username,
        row.assigned_investigator_username,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search),
    );
  }, [rows, q]);

  const activeInvestigations = rows.filter(
    (row) =>
      row.status === "OPEN" ||
      row.status === "UNDER_INVESTIGATION",
  ).length;

  const awaitingLegalAction = rows.filter(
    (row) =>
      row.status === "CHARGESHEET_FILED" ||
      row.status === "COURT",
  ).length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Investigation workspace"
        title="Cases"
        description="Manage case lifecycle, assignments, priorities and related records."
        action={{
          href: "/dashboard/cases/new",
          label: "Create case",
          icon: <Plus size={17} />,
        }}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <FolderKanban
            className="text-blue-600"
            size={18}
          />

          <p className="mt-3 text-2xl font-bold">
            {rows.length}
          </p>

          <p className="text-xs text-slate-500">
            Visible cases
          </p>
        </div>

        <div className="card p-4">
          <Users
            className="text-violet-600"
            size={18}
          />

          <p className="mt-3 text-2xl font-bold">
            {activeInvestigations}
          </p>

          <p className="text-xs text-slate-500">
            Active investigations
          </p>
        </div>

        <div className="card p-4">
          <ChevronRight
            className="text-amber-600"
            size={18}
          />

          <p className="mt-3 text-2xl font-bold">
            {awaitingLegalAction}
          </p>

          <p className="text-xs text-slate-500">
            Legal / court stage
          </p>
        </div>
      </div>

      <div className="card p-3">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={17}
          />

          <input
            className="input pl-10"
            value={q}
            onChange={(event) =>
              setQ(event.target.value)
            }
            placeholder="Search case number, FIR, title, officer, status…"
          />
        </div>
      </div>

      <section className="card overflow-hidden">
        {loading ? (
          <Loading />
        ) : error ? (
          <div className="p-8 text-center">
            <p className="font-semibold text-red-600">
              {error}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Please try again after checking the
              backend connection.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <FolderKanban
              className="mx-auto text-slate-300"
              size={32}
            />

            <p className="mt-3 font-semibold text-slate-700">
              {q
                ? "No matching cases found."
                : "No cases available."}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {q
                ? "Try a different search term."
                : "Cases created from accepted complaints will appear here."}
            </p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Case</th>
                  <th>Status</th>
                  <th>Officer</th>
                  <th>Investigator</th>
                  <th>Opened</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={String(row.id)}
                    className="cursor-pointer"
                  >
                    <td>
                      <Link
                        href={`/dashboard/cases/${row.id}`}
                        className="block"
                      >
                        <p className="font-bold text-slate-800">
                          {pick(
                            row,
                            "case_number",
                            "id",
                          )}
                        </p>

                        <p className="text-xs text-slate-400">
                          {pick(
                            row,
                            "title",
                            "name",
                          )}
                        </p>

                        {row.fir_number && (
                          <p className="mt-1 text-[11px] text-slate-400">
                            FIR: {row.fir_number}
                          </p>
                        )}
                      </Link>
                    </td>

                    <td>
                      <span
                        className={statusTone(
                          pick(row, "status"),
                        )}
                      >
                        {pick(row, "status")}
                      </span>
                    </td>

                    <td>
                      {pick(
                        row,
                        "assigned_officer_username",
                        "assigned_officer",
                      )}
                    </td>

                    <td>
                      {pick(
                        row,
                        "assigned_investigator_username",
                        "assigned_investigator",
                      )}
                    </td>

                    <td>
                      {dateLabel(row.created_at)}
                    </td>

                    <td>
                      <Link
                        href={`/dashboard/cases/${row.id}`}
                        className="text-slate-400 hover:text-slate-700"
                        aria-label="View case"
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}