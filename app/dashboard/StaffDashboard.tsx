"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FileText,
  FolderOpen,
  ShieldCheck,
  Clock3,
  ArrowUpRight,
  UploadCloud,
  Search,
  BrainCircuit,
  Scale,
  Database,
  Activity,
  Users,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { Loading } from "@/components/Loading";
import {
  adminApi,
  auditApi,
  casesApi,
  documentsApi,
  evidenceApi,
  legalApi,
} from "@/services/api";
import { pick, statusTone, dateLabel } from "@/lib/format";

type DashboardData = {
  statistics: {
    total_cases: number;
    active_cases: number;
    total_documents: number;
    total_evidence: number;
    pending_legal_reviews: number;
    upcoming_hearings: number;
    integrity_verified: number | null;
  };
  recent_documents: any[];
  recent_activity: any[];
  users?: any;
  verification?: any;
  cases?: any;
  evidence?: any;
  documents?: any;
};

const emptyData: DashboardData = {
  statistics: {
    total_cases: 0,
    active_cases: 0,
    total_documents: 0,
    total_evidence: 0,
    pending_legal_reviews: 0,
    upcoming_hearings: 0,
    integrity_verified: null,
  },
  recent_documents: [],
  recent_activity: [],
};

function listFrom(response: any): any[] {
  const value = response?.data ?? response;
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  return [];
}

function numberOf(response: any): number {
  const value = response?.data ?? response;
  if (typeof value?.count === "number") return value.count;
  return listFrom(response).length;
}

function isClosedCase(item: any) {
  return ["CLOSED", "ARCHIVED", "DISPOSED"].includes(
    String(item?.status ?? "").toUpperCase(),
  );
}

export default function StaffDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      let currentRole = "";
      try {
        const stored = JSON.parse(localStorage.getItem("sddms_user") || "{}");
        currentRole = stored?.role || "";
        if (mounted) setRole(currentRole);
      } catch {
        currentRole = "";
      }

      try {
        if (currentRole === "ADMIN") {
          const response: any = await adminApi.dashboard();
          const raw = response?.data ?? response;
          const docsResponse = await documentsApi.list();
          const docs = listFrom(docsResponse);

          if (!mounted) return;

          const totalCases = Number(raw?.cases?.total ?? 0);
          const closedCases = Array.isArray(raw?.cases?.by_status)
            ? raw.cases.by_status
                .filter((x: any) => isClosedCase(x))
                .reduce((sum: number, x: any) => sum + Number(x?.count ?? 0), 0)
            : 0;

          const totalEvidence = Number(raw?.evidence?.total ?? 0);
          const verifiedEvidence = Number(
            raw?.security?.integrity_verified ?? 0,
          );

          setData({
            statistics: {
              total_cases: totalCases,
              active_cases: Math.max(0, totalCases - closedCases),
              total_documents: Number(raw?.documents?.total ?? 0),
              total_evidence: totalEvidence,
              pending_legal_reviews: Number(
                raw?.verification?.pending ?? 0,
              ),
              upcoming_hearings: Number(
                raw?.legal?.total_hearings ?? 0,
              ),
              integrity_verified:
                totalEvidence > 0
                  ? Math.round((verifiedEvidence / totalEvidence) * 100)
                  : null,
            },
            recent_documents: docs.slice(0, 8),
            recent_activity: Array.isArray(raw?.recent_activity)
              ? raw.recent_activity
              : [],
            users: raw?.users,
            verification: raw?.verification,
            cases: raw?.cases,
            evidence: raw?.evidence,
            documents: raw?.documents,
          });
          return;
        }

        // Staff dashboard uses the same protected APIs as the staff pages.
        // This keeps counts and recent records limited by backend permissions.
        const [casesResult, docsResult, evidenceResult, reviewsResult, hearingsResult, auditResult] =
          await Promise.allSettled([
            casesApi.list(),
            documentsApi.list(),
            evidenceApi.list(),
            legalApi.reviews.list(),
            legalApi.hearings.list(),
            auditApi.list(),
          ]);

        if (!mounted) return;

        const cases =
          casesResult.status === "fulfilled"
            ? listFrom(casesResult.value)
            : [];
        const docs =
          docsResult.status === "fulfilled" ? listFrom(docsResult.value) : [];
        const evidence =
          evidenceResult.status === "fulfilled"
            ? listFrom(evidenceResult.value)
            : [];
        const reviews =
          reviewsResult.status === "fulfilled"
            ? listFrom(reviewsResult.value)
            : [];
        const hearings =
          hearingsResult.status === "fulfilled"
            ? listFrom(hearingsResult.value)
            : [];
        const activity =
          auditResult.status === "fulfilled"
            ? listFrom(auditResult.value)
            : [];

        const activeCases = cases.filter((item) => !isClosedCase(item)).length;
        const pendingReviews = reviews.filter((item) =>
          ["PENDING", "UNDER_REVIEW", "SUBMITTED"].includes(
            String(item?.status ?? "").toUpperCase(),
          ),
        ).length;
        const upcomingHearings = hearings.filter(
          (item) =>
            !["COMPLETED", "CANCELLED"].includes(
              String(item?.status ?? "").toUpperCase(),
            ),
        ).length;
        const verified = evidence.filter(
          (item) =>
            item?.integrity_verified === true ||
            String(item?.integrity_status ?? "").toUpperCase() === "VERIFIED",
        ).length;

        setData({
          statistics: {
            total_cases: cases.length,
            active_cases: activeCases,
            total_documents: docs.length,
            total_evidence: evidence.length,
            pending_legal_reviews: pendingReviews,
            upcoming_hearings: upcomingHearings,
            integrity_verified:
              evidence.length > 0
                ? Math.round((verified / evidence.length) * 100)
                : null,
          },
          recent_documents: docs
            .slice()
            .sort(
              (a, b) =>
                new Date(b?.created_at ?? 0).getTime() -
                new Date(a?.created_at ?? 0).getTime(),
            )
            .slice(0, 8),
          recent_activity: activity
            .slice()
            .sort(
              (a, b) =>
                new Date(b?.created_at ?? 0).getTime() -
                new Date(a?.created_at ?? 0).getTime(),
            )
            .slice(0, 10),
        });

        if (
          casesResult.status === "rejected" &&
          docsResult.status === "rejected" &&
          evidenceResult.status === "rejected"
        ) {
          setError("Dashboard data is unavailable from the current API.");
        }
      } catch (err) {
        console.error("Dashboard load failed:", err);
        if (mounted) {
          setData(emptyData);
          setError("Dashboard data is unavailable from the current API.");
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (!data) return <Loading />;

  const s = data.statistics;
  const admin = role === "ADMIN";
  const docs = data.recent_documents;
  const activity = data.recent_activity;
  const adminUsers = data.users;
  const adminVerification = data.verification;

  return (
    <div className="space-y-6 animate-fade-up overflow-x-hidden">
      <PageHeader
        eyebrow="Secure operations • live overview"
        title="Command dashboard"
        description="A single operational view across protected case files, evidence, legal work and system integrity."
        action={{
          href: "/dashboard/upload",
          label: "Upload document",
          icon: <UploadCloud size={17} />,
        }}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 stagger">
        {[
          [FileText, s.total_documents, "Documents", "Protected records"],
          [FolderOpen, s.total_cases, "Cases", "Investigation workload"],
          [Database, s.total_evidence, "Evidence items", "Integrity controlled"],
          [
            Clock3,
            admin ? adminVerification?.pending ?? 0 : s.pending_legal_reviews,
            admin ? "Pending verification" : "Pending actions",
            admin ? "Identity review queue" : "Legal review queue",
          ],
        ].map(([Icon, value, label, sub]) => (
          <div className="card min-w-0 p-5" key={String(label)}>
            <div className="flex items-start justify-between">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                <Icon size={19} />
              </div>
              <ArrowUpRight size={16} className="text-slate-300" />
            </div>
            <p className="mt-5 truncate text-2xl font-bold text-slate-900">
              {String(value)}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              {String(label)}
            </p>
            <p className="mt-1 text-xs text-slate-400">{String(sub)}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">
        <section className="card min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-bold">Recent protected records</h2>
              <p className="text-xs text-slate-400">Latest records available to your role</p>
            </div>
            <Link href="/dashboard/documents" className="text-sm font-semibold text-blue-600">
              View all <ArrowUpRight className="ml-1 inline" size={14} />
            </Link>
          </div>
          <div className="table-wrap">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Case</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {docs.length ? (
                  docs.map((d: any) => (
                    <tr key={d.id ?? d.title}>
                      <td>
                        <p className="font-semibold text-slate-800">{pick(d, "title", "name")}</p>
                        <p className="text-xs text-slate-400">{pick(d, "document_type", "type")}</p>
                      </td>
                      <td className="font-medium">{pick(d, "case_number", "case")}</td>
                      <td>
                        <span className={statusTone(pick(d, "status", "integrity_status"))}>
                          {pick(d, "status", "integrity_status")}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-14 text-center text-sm text-slate-400">
                      No recent records were returned by the API.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-5">
          <section className="card p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-50 p-2 text-violet-600">
                <BrainCircuit size={18} />
              </div>
              <div>
                <h2 className="font-bold">Intelligence workspace</h2>
                <p className="text-xs text-slate-400">Assisted analysis with human oversight</p>
              </div>
            </div>
            <div className="mt-5 grid gap-2">
              <Link href="/dashboard/ai" className="btn-secondary justify-between">
                Analyze document <ArrowUpRight size={16} />
              </Link>
              <Link href="/dashboard/search" className="btn-secondary justify-between">
                Search across records <Search size={16} />
              </Link>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl bg-navy p-5 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/10 p-2">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h2 className="font-bold">Security posture</h2>
                <p className="text-xs text-blue-100">Integrity & access controls</p>
              </div>
            </div>
            <div className="mt-5">
              <div className="flex items-end justify-between gap-3">
                <span className="text-sm text-blue-100">Integrity verified</span>
                <b className="text-2xl">
                  {s.integrity_verified ?? "—"}
                  {s.integrity_verified != null ? "%" : ""}
                </b>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{ width: `${Math.min(100, Math.max(0, Number(s.integrity_verified ?? 0)))}%` }}
                />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white/10 p-3">
                <CheckCircle2 size={15} className="text-emerald-300" />
                <p className="mt-2 text-xs">Audit logging</p>
                <p className="text-[10px] text-blue-100">Enabled</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <ShieldCheck size={15} className="text-blue-200" />
                <p className="mt-2 text-xs">RBAC</p>
                <p className="text-[10px] text-blue-100">Active</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold">Operational activity</h2>
              <p className="text-xs text-slate-400">Recent auditable events</p>
            </div>
            <Link href="/dashboard/audit" className="text-sm font-semibold text-blue-600">Audit trail</Link>
          </div>
          <div className="mt-4 space-y-2">
            {activity.length ? (
              activity.slice(0, 5).map((a: any) => (
                <div key={a.id ?? `${a.action}-${a.created_at}`} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="rounded-lg bg-white p-2 text-blue-600 shadow-sm"><Activity size={15} /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{a.action}</p>
                    <p className="truncate text-xs text-slate-400">{a.username ?? a.actor ?? "System"} • {a.description ?? "Activity recorded"}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-slate-400">{dateLabel(a.created_at)}</span>
                </div>
              ))
            ) : (
              <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-400">No activity returned yet.</div>
            )}
          </div>
        </section>

        <section className="card p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600"><AlertTriangle size={18} /></div>
            <div>
              <h2 className="font-bold">Priority actions</h2>
              <p className="text-xs text-slate-400">Items requiring attention</p>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            {admin ? (
              <>
                <Link href="/dashboard/admin" className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
                  <span className="text-sm font-semibold">Identity verifications awaiting decision</span>
                  <b className="text-amber-600">{adminVerification?.pending ?? 0}</b>
                </Link>
                <Link href="/dashboard/admin" className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
                  <span className="text-sm font-semibold">Inactive accounts</span>
                  <b className="text-slate-700">{adminUsers?.inactive ?? 0}</b>
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard/legal" className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
                  <span className="text-sm font-semibold">Legal reviews awaiting decision</span>
                  <b className="text-amber-600">{s.pending_legal_reviews}</b>
                </Link>
                <Link href="/dashboard/legal" className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
                  <span className="text-sm font-semibold">Upcoming court hearings</span>
                  <b className="text-blue-600">{s.upcoming_hearings}</b>
                </Link>
              </>
            )}
          </div>
        </section>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [FolderOpen, "Case management", "Assignments, status, history and case-linked records.", "/dashboard/cases"],
          [Scale, "Legal workspace", "Reviews, hearings, approvals and deadlines.", "/dashboard/legal"],
          [Database, "Evidence control", "Chain-of-custody records and integrity verification.", "/dashboard/evidence"],
          [Users, "Administration", admin ? "Identity, roles, verification and account access." : "Available to administrators.", "/dashboard/admin"],
        ].map(([Icon, title, desc, href]) => (
          <Link key={String(title)} href={String(href)} className="card min-w-0 p-5 transition hover:-translate-y-1 hover:shadow-lg">
            <Icon className="text-blue-600" size={19} />
            <p className="mt-3 font-bold">{String(title)}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{String(desc)}</p>
          </Link>
        ))}
      </section>

      {error && <p className="text-xs text-amber-700">{error}</p>}
    </div>
  );
}
