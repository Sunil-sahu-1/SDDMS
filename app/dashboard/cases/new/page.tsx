"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { casesApi, adminApi } from "@/services/api";

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "UNDER_INVESTIGATION", label: "Under Investigation" },
  { value: "CHARGESHEET_FILED", label: "Chargesheet Filed" },
  { value: "COURT", label: "Court" },
  { value: "CLOSED", label: "Closed" },
];

type StaffUser = {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  department?: string;
  role: string;
  is_active: boolean;
  verification_status?: string;
};

type ApiErrorLike = {
  message?: string;
  status?: number;
  body?: unknown;
};

function staffLabel(user: StaffUser) {
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return name ? `${name} (${user.username})` : user.username;
}

export default function NewCasePage() {
  const router = useRouter();

  const [caseNumber, setCaseNumber] = useState("");
  const [firNumber, setFirNumber] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("OPEN");

  const [officers, setOfficers] = useState<StaffUser[]>([]);
  const [investigators, setInvestigators] = useState<StaffUser[]>([]);
  const [assignedOfficer, setAssignedOfficer] = useState("");
  const [assignedInvestigator, setAssignedInvestigator] = useState("");
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [staffError, setStaffError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadStaff = async () => {
      setLoadingStaff(true);
      setStaffError("");

      try {
        const response = await adminApi.users();
        const users = Array.isArray(response?.data) ? response.data : [];

        const verifiedActiveStaff = users.filter(
          (user) => user.is_active && user.verification_status === "VERIFIED",
        );

        if (!mounted) return;

        setOfficers(
          verifiedActiveStaff.filter(
            (user) => user.role === "POLICE_OFFICER",
          ),
        );

        setInvestigators(
          verifiedActiveStaff.filter(
            (user) => user.role === "INVESTIGATOR",
          ),
        );
      } catch (err: unknown) {
        if (!mounted) return;

        const apiError = err as ApiErrorLike;

        if (apiError.status === 403) {
          setStaffError(
            "Only an administrator can load and assign verified staff members.",
          );
        } else if (apiError.status === 401) {
          setStaffError("Your session has expired. Please log in again.");
        } else if (apiError.message) {
          setStaffError(apiError.message);
        } else {
          setStaffError("Unable to load available staff members.");
        }
      } finally {
        if (mounted) setLoadingStaff(false);
      }
    };

    loadStaff();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedCaseNumber = caseNumber.trim();
    const trimmedFirNumber = firNumber.trim();
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedCaseNumber) {
      setError("Case number is required.");
      return;
    }

    if (!trimmedTitle) {
      setError("Case title is required.");
      return;
    }

    if (!trimmedDescription) {
      setError("Case description is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        case_number: trimmedCaseNumber,
        fir_number: trimmedFirNumber || trimmedCaseNumber,
        title: trimmedTitle,
        description: trimmedDescription,
        status,
        assigned_officer: assignedOfficer ? Number(assignedOfficer) : null,
        assigned_investigator: assignedInvestigator
          ? Number(assignedInvestigator)
          : null,
      };

      console.log("Creating case:", payload);

      const response = await casesApi.create(payload);

      console.log("Case created successfully:", response);

      setSuccess("Case created successfully.");

      setTimeout(() => {
        router.push("/dashboard/cases");
        router.refresh();
      }, 700);
    } catch (err: unknown) {
      console.error("Case creation failed:", err);

      const apiError = err as ApiErrorLike;
      let message = "Unable to create the case.";

      if (typeof apiError?.message === "string" && apiError.message.trim()) {
        message = apiError.message;
      } else if (typeof err === "string" && err.trim()) {
        message = err;
      }

      if (
        apiError?.body &&
        typeof apiError.body === "object" &&
        apiError.body !== null
      ) {
        const body = apiError.body as Record<string, unknown>;
        const possibleMessages: string[] = [];

        Object.entries(body).forEach(([field, value]) => {
          if (Array.isArray(value)) {
            value.forEach((item) => {
              possibleMessages.push(`${field}: ${String(item)}`);
            });
          } else if (typeof value === "string") {
            possibleMessages.push(`${field}: ${value}`);
          } else if (value !== undefined && value !== null) {
            possibleMessages.push(`${field}: ${JSON.stringify(value)}`);
          }
        });

        if (possibleMessages.length > 0) {
          message = possibleMessages.join("\n");
        }
      }

      if (apiError?.status === 401) {
        message = "Your session has expired. Please log in again.";
      }

      if (apiError?.status === 403) {
        message =
          "You do not have permission to create a case. Please use a verified administrator account.";
      }

      if (apiError?.status === 404) {
        message =
          "The Case API endpoint was not found. Please check that the Django backend is running and the API URL is correct.";
      }

      if (apiError?.status === 500) {
        message =
          "The backend encountered an internal error while creating the case.";
      }

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/cases");
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Case Intake
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Create case
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Register a controlled case record and route it to the
                appropriate investigation team.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              className="w-fit rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Back to cases
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <form onSubmit={handleSubmit}>
            <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
              <h2 className="text-lg font-semibold text-slate-900">
                Case information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter the basic information required to create the case record.
              </p>
            </div>

            <div className="space-y-7 px-6 py-7 sm:px-8">
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700">
                      !
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-red-800">
                        Case creation failed
                      </p>

                      <p className="mt-1 whitespace-pre-line text-sm leading-6 text-red-700">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div
                  role="status"
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4"
                >
                  <p className="font-semibold text-emerald-800">{success}</p>

                  <p className="mt-1 text-sm text-emerald-700">
                    Redirecting to the cases page...
                  </p>
                </div>
              )}

              <section>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-800">
                    Identification
                  </h3>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="caseNumber"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Case Number<span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      id="caseNumber"
                      name="case_number"
                      type="text"
                      value={caseNumber}
                      onChange={(event) => setCaseNumber(event.target.value)}
                      placeholder="e.g. CASE-2026-001"
                      autoComplete="off"
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="firNumber"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      FIR Number
                    </label>

                    <input
                      id="firNumber"
                      name="fir_number"
                      type="text"
                      value={firNumber}
                      onChange={(event) => setFirNumber(event.target.value)}
                      placeholder="e.g. FIR-01"
                      autoComplete="off"
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    />
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-800">
                    Case details
                  </h3>
                </div>

                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="title"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Case Title<span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      id="title"
                      name="title"
                      type="text"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Enter the case title"
                      disabled={isSubmitting}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Case Description
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <textarea
                      id="description"
                      name="description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Provide a concise description of the case, incident, and relevant background."
                      rows={7}
                      disabled={isSubmitting}
                      className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      Include only information appropriate for the initial case
                      record.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-800">
                    Assignment
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Assign verified active staff members responsible for the
                    case and investigation.
                  </p>
                </div>

                {staffError && (
                  <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    {staffError}
                  </div>
                )}

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="assignedOfficer"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Assigned Officer
                    </label>

                    <select
                      id="assignedOfficer"
                      name="assigned_officer"
                      value={assignedOfficer}
                      onChange={(event) => setAssignedOfficer(event.target.value)}
                      disabled={isSubmitting || loadingStaff}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    >
                      <option value="">
                        {loadingStaff ? "Loading officers..." : "Unassigned"}
                      </option>

                      {officers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {staffLabel(user)}
                          {user.department ? ` — ${user.department}` : ""}
                        </option>
                      ))}
                    </select>

                    <p className="mt-2 text-xs text-slate-500">
                      Only active, verified police officers are shown.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="assignedInvestigator"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Assigned Investigation Officer
                    </label>

                    <select
                      id="assignedInvestigator"
                      name="assigned_investigator"
                      value={assignedInvestigator}
                      onChange={(event) =>
                        setAssignedInvestigator(event.target.value)
                      }
                      disabled={isSubmitting || loadingStaff}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                    >
                      <option value="">
                        {loadingStaff ? "Loading investigators..." : "Unassigned"}
                      </option>

                      {investigators.map((user) => (
                        <option key={user.id} value={user.id}>
                          {staffLabel(user)}
                          {user.department ? ` — ${user.department}` : ""}
                        </option>
                      ))}
                    </select>

                    <p className="mt-2 text-xs text-slate-500">
                      Only active, verified investigators are shown.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-800">
                    Initial status
                  </h3>
                </div>

                <div className="max-w-md">
                  <label
                    htmlFor="status"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Case Status
                  </label>

                  <select
                    id="status"
                    name="status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <p className="mt-2 text-xs text-slate-500">
                    New cases normally start with Open status.
                  </p>
                </div>
              </section>

              <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-4">
                <p className="text-sm font-semibold text-indigo-900">
                  Controlled case creation
                </p>

                <p className="mt-1 text-sm leading-6 text-indigo-800">
                  The case will be submitted to the Django API and recorded in
                  the case history/audit workflow.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-end sm:px-8">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Creating case..." : "Create case"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
