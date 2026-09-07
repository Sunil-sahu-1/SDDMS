"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { ApiError, complaintsApi } from "@/services/api";

export default function NewComplaint() {
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setBusy(true);
    setError("");

    try {
      await complaintsApi.create({
        subject: title.trim(),
        description: description.trim(),
      });

      alert("Complaint submitted successfully.");
      router.push("/dashboard/complaints");
      router.refresh();
    } catch (error) {
      console.error("Complaint submission failed:", error);

      if (error instanceof ApiError) {
        setError(
          error.message ||
            `Complaint submission failed (${error.status}).`,
        );
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Unable to submit the complaint.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Complaint intake"
        title="Register complaint"
        description="Capture an initial complaint before it is converted into a controlled case workflow."
      />

      {error && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          <div className="font-semibold">
            Complaint submission failed
          </div>

          <div className="mt-1">
            {error}
          </div>
        </div>
      )}

      <form
        onSubmit={submit}
        className="card p-5 sm:p-7"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">
              Complaint subject
            </label>

            <input
              className="input"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              required
              disabled={busy}
              placeholder="Enter complaint subject"
            />
          </div>

          <div>
            <label className="label">
              Priority
            </label>

            <select
              className="input"
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value)
              }
              disabled={busy}
            >
              <option value="Medium">
                Medium
              </option>

              <option value="High">
                High
              </option>

              <option value="Critical">
                Critical
              </option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="label">
              Narrative
            </label>

            <textarea
              className="input min-h-44"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              required
              disabled={busy}
              placeholder="Record the complaint narrative and relevant facts…"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
            disabled={busy}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              busy ||
              !title.trim() ||
              !description.trim()
            }
            className="btn-primary"
          >
            {busy
              ? "Registering…"
              : "Register complaint"}
          </button>
        </div>
      </form>
    </div>
  );
}