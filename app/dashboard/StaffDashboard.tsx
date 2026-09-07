"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity, BarChart3, BellRing, CheckCircle2, Clock3, Database,
  FileText, FolderOpen, Landmark, LockKeyhole, Plus, Search,
  ShieldCheck, Sparkles, UploadCloud, Users,
} from "lucide-react";
import { adminApi, auditApi, casesApi, documentsApi, evidenceApi, legalApi } from "@/services/api";
import { pick, dateLabel } from "@/lib/format";
import { Loading } from "@/components/Loading";

type Dash = {
  cases: number;
  active: number;
  documents: number;
  evidence: number;
  pending: number;
  integrity: number | null;
  docs: any[];
  activity: any[];
};

const empty: Dash = {
  cases: 0, active: 0, documents: 0, evidence: 0, pending: 0,
  integrity: null, docs: [], activity: [],
};

const listOf = (r: any) => {
  const v = r?.data ?? r;
  return Array.isArray(v) ? v : Array.isArray(v?.results) ? v.results : [];
};

const closed = (x: any) =>
  ["CLOSED", "ARCHIVED", "DISPOSED", "COMPLETED"].includes(
    String(x?.status ?? "").toUpperCase(),
  );

export default function StaffDashboard() {
  const [data, setData] = useState<Dash | null>(null);
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;

    (async () => {
      let currentRole = "";
      try {
        currentRole = JSON.parse(localStorage.getItem("sddms_user") || "{}").role || "";
        if (live) setRole(currentRole);
      } catch {}

      try {
        let d: Dash;

        if (currentRole === "ADMIN") {
          const [dashboardResult, documentsResult] = await Promise.all([
            adminApi.dashboard(),
            documentsApi.list(),
          ]);
          const raw: any = (dashboardResult as any)?.data ?? dashboardResult;
          const docs = listOf(documentsResult);
          const total = Number(raw?.cases?.total ?? 0);
          const byStatus = Array.isArray(raw?.cases?.by_status) ? raw.cases.by_status : [];
          const done = byStatus
            .filter((x: any) => closed(x))
            .reduce((n: number, x: any) => n + Number(x?.count ?? 0), 0);
          const evidenceTotal = Number(raw?.evidence?.total ?? 0);
          const verified = Number(raw?.security?.integrity_verified ?? 0);

          d = {
            cases: total,
            active: Math.max(0, total - done),
            documents: Number(raw?.documents?.total ?? docs.length),
            evidence: evidenceTotal,
            pending: Number(raw?.verification?.pending ?? 0),
            integrity: evidenceTotal ? Math.round((verified / evidenceTotal) * 100) : null,
            docs: docs.slice(0, 8),
            activity: Array.isArray(raw?.recent_activity) ? raw.recent_activity : [],
          };
        } else {
          const results = await Promise.allSettled([
            casesApi.list(),
            documentsApi.list(),
            evidenceApi.list(),
            legalApi.reviews.list(),
            auditApi.list(),
          ]);

          const cases = results[0].status === "fulfilled" ? listOf(results[0].value) : [];
          const docs = results[1].status === "fulfilled" ? listOf(results[1].value) : [];
          const evidence = results[2].status === "fulfilled" ? listOf(results[2].value) : [];
          const reviews = results[3].status === "fulfilled" ? listOf(results[3].value) : [];
          const activity = results[4].status === "fulfilled" ? listOf(results[4].value) : [];
          const verified = evidence.filter(
            (x: any) => x?.integrity_verified === true ||
              String(x?.integrity_status ?? "").toUpperCase() === "VERIFIED",
          ).length;

          d = {
            cases: cases.length,
            active: cases.filter((x: any) => !closed(x)).length,
            documents: docs.length,
            evidence: evidence.length,
            pending: reviews.filter((x: any) =>
              ["PENDING", "UNDER_REVIEW", "SUBMITTED"].includes(
                String(x?.status ?? "").toUpperCase(),
              ),
            ).length,
            integrity: evidence.length ? Math.round((verified / evidence.length) * 100) : null,
            docs: docs
              .sort((a: any, b: any) =>
                new Date(b?.created_at ?? 0).getTime() - new Date(a?.created_at ?? 0).getTime(),
              )
              .slice(0, 8),
            activity: activity
              .sort((a: any, b: any) =>
                new Date(b?.created_at ?? 0).getTime() - new Date(a?.created_at ?? 0).getTime(),
              )
              .slice(0, 8),
          };
        }

        if (live) setData(d);
      } catch (e) {
        console.error(e);
        if (live) {
          setData(empty);
          setError("Some dashboard services are unavailable. Showing available records.");
        }
      }
    })();

    return () => {
      live = false;
    };
  }, []);

  // All hooks must run on every render, before any conditional return.
  const view = data ?? empty;
  const isAdmin = role === "ADMIN";
  const integrity = view.integrity ?? 0;
  const total = view.documents + view.evidence + view.cases || 1;
  const distribution = useMemo(
    () => ({
      cases: Math.round((view.cases / total) * 100),
      evidence: Math.round((view.evidence / total) * 100),
      docs: Math.round((view.documents / total) * 100),
    }),
    [view, total],
  );

  if (!data) return <Loading />;

  const stats = [
    { label: "Total Documents", value: view.documents, sub: "Protected records", icon: FileText, href: "/dashboard/documents", cls: "stat-orange" },
    { label: "Active Cases", value: view.active, sub: "Under investigation", icon: FolderOpen, href: "/dashboard/cases", cls: "stat-blue" },
    { label: "Evidence Items", value: view.evidence, sub: "Integrity controlled", icon: Database, href: "/dashboard/evidence", cls: "stat-green" },
    { label: "Pending Verification", value: view.pending, sub: "Requires review", icon: Clock3, href: isAdmin ? "/dashboard/users" : "/dashboard/legal", cls: "stat-purple" },
  ];

  return (
    <div className="gov-dashboard animate-fade-up">
      <section className="gov-hero">
        <div className="gov-hero-art">
          <div className="sun-glow" />
          <div className="arch-art"><Landmark size={150} strokeWidth={1} /></div>
          <div className="tricolor-swoosh swoosh-one" />
          <div className="tricolor-swoosh swoosh-two" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <p className="gov-eyebrow">MINISTRY OF HOME AFFAIRS • SECURE OPERATIONS</p>
          <h1>Welcome back, <span>{isAdmin ? "Administrator" : "Officer"}!</span></h1>
          <p className="gov-subtitle">Secure access to critical information. Maintain integrity. Serve the Nation.</p>
          <div className="gov-badges">
            <span><ShieldCheck size={14} /> Government secure workspace</span>
            <span><LockKeyhole size={13} /> Role-based access active</span>
          </div>
        </div>
        <div className="hero-quote"><b>“A safer India<br />is a stronger India.”</b><small>— Government of India</small></div>
      </section>

      {error && <div className="gov-alert">{error}</div>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon, href, cls }) => (
          <Link key={label} href={href} className={`gov-stat ${cls}`}>
            <div className="stat-icon"><Icon size={22} /></div>
            <div className="stat-content"><p>{label}</p><strong>{value}</strong><small>{sub}</small></div>
            <span className="stat-spark"><BarChart3 size={42} /></span>
          </Link>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_320px_300px]">
        <div className="gov-feature">
          <div className="feature-art">
            <div className="feature-chakra">✥</div>
            <div className="feature-building"><Landmark size={115} strokeWidth={1} /></div>
            <div className="feature-wave wave-orange" />
            <div className="feature-wave wave-green" />
          </div>
          <div className="feature-copy">
            <p>SECURE DIGITAL INDIA</p>
            <h2>Secure Records<br />for a Stronger <em>Bharat</em></h2>
            <span>Technology&nbsp; | &nbsp;Transparency&nbsp; | &nbsp;Justice</span>
            <div className="feature-points">
              <b><ShieldCheck size={19} /> Secure.</b><b><Search size={19} /> Transparent.</b><b><Users size={19} /> Accountable.</b>
            </div>
          </div>
        </div>

        <section className="gov-panel">
          <div className="panel-title"><div><p>WORKSPACE</p><h3>Quick Actions</h3></div><Sparkles size={20} /></div>
          <div className="quick-grid">
            <Link href="/dashboard/cases/new" className="quick orange"><Plus size={18} />Create Case</Link>
            <Link href="/dashboard/evidence/new" className="quick green"><Plus size={18} />Add Evidence</Link>
            <Link href="/dashboard/upload" className="quick blue"><UploadCloud size={18} />Upload Document</Link>
            <Link href="/dashboard/search" className="quick neutral"><Search size={18} />Search Records</Link>
            <Link href="/dashboard/audit" className="quick neutral"><ShieldCheck size={18} />Verify Integrity</Link>
            <Link href="/dashboard/ai" className="quick purple"><Sparkles size={18} />AI Assistant</Link>
          </div>
        </section>

        <section className="gov-panel security-panel">
          <div className="panel-title"><div><p>SECURITY POSTURE</p><h3>System Secure</h3></div><span className="live-pill"><i />Live</span></div>
          <div className="donut" style={{ "--value": `${integrity * 3.6}deg` } as React.CSSProperties}>
            <div><strong>{view.integrity == null ? "—" : `${integrity}%`}</strong><small>Secure</small></div>
          </div>
          <div className="security-list">
            <span><CheckCircle2 /> Integrity Verification <b>Operational</b></span>
            <span><CheckCircle2 /> Access Controls <b>Operational</b></span>
            <span><CheckCircle2 /> Audit Logging <b>Operational</b></span>
            <span><CheckCircle2 /> AI Services <b>Operational</b></span>
          </div>
        </section>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_1.2fr_.85fr]">
        <section className="gov-panel activity-panel">
          <div className="panel-title"><div><p>ACTIVITY STREAM</p><h3>Recent Activity</h3></div><Link href="/dashboard/audit">View All</Link></div>
          <div className="timeline">
            {view.activity.length ? view.activity.slice(0, 5).map((a: any, i: number) => (
              <div className="timeline-row" key={a.id ?? i}>
                <span className={`dot dot-${i % 3}`} /><div><b>{pick(a, "action", "event", "activity")}</b><small>{pick(a, "description", "resource", "message", "details")}</small></div><time>{dateLabel(a?.created_at)}</time>
              </div>
            )) : <div className="empty-small"><BellRing size={20} />No recent activity</div>}
          </div>
        </section>

        <section className="gov-panel distribution">
          <div className="panel-title"><div><p>RECORD ANALYTICS</p><h3>Document Distribution</h3></div><BarChart3 size={20} /></div>
          <div className="distribution-body">
            <div className="analytics-donut"><div><strong>{view.documents + view.evidence + view.cases}</strong><small>Total</small></div></div>
            <div className="legend">
              <span><i className="l-blue" />Case Files <b>{distribution.cases}%</b></span>
              <span><i className="l-green" />Evidence Files <b>{distribution.evidence}%</b></span>
              <span><i className="l-orange" />Documents <b>{distribution.docs}%</b></span>
              <span><i className="l-purple" />Complaints <b>—</b></span>
            </div>
          </div>
        </section>

        <section className="gov-panel ai-panel">
          <div className="panel-title"><div><p>INTELLIGENCE</p><h3>AI Intelligence</h3></div><Link href="/dashboard/ai">Explore</Link></div>
          <div className="ai-list">
            <Link href="/dashboard/ai"><FileText /><span><b>Analyze document</b><small>Extract key information</small></span></Link>
            <Link href="/dashboard/search"><Search /><span><b>Search across records</b><small>Natural language search</small></span></Link>
            <Link href="/dashboard/ai"><Sparkles /><span><b>Generate case summary</b><small>AI-powered insights</small></span></Link>
            <Link href="/dashboard/evidence"><ShieldCheck /><span><b>Find related evidence</b><small>Smart recommendations</small></span></Link>
          </div>
        </section>
      </section>

      <footer className="gov-footer">
        <div className="footer-emblem"><Landmark size={30} /><span>SATYAMEVA<br /><small>JAYATE</small></span></div>
        <div><b>Government of India</b><small>Secure Digital Document Management System</small></div>
        <div className="footer-right">Secure Governance&nbsp; | &nbsp;Digital Records&nbsp; | &nbsp;Transparent Justice</div>
      </footer>
    </div>
  );
}
