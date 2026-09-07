export function pick(
  obj: Record<string, unknown> | null | undefined,
  ...keys: string[]
) {
  if (!obj) return "—";

  for (const k of keys) {
    if (
      obj[k] !== undefined &&
      obj[k] !== null &&
      obj[k] !== ""
    ) {
      return String(obj[k]);
    }
  }

  return "—";
}

export function dateLabel(value?: unknown) {
  if (!value) return "—";

  const d = new Date(String(value));

  return Number.isNaN(d.getTime())
    ? String(value)
    : d.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

export function statusTone(value: string) {
  const v = value.toLowerCase();

  if (
    /(verified|approved|active|signed|completed|closed)/.test(
      v,
    )
  ) {
    return "status-good";
  }

  if (
    /(pending|review|warning|draft|investigation)/.test(
      v,
    )
  ) {
    return "status-warn";
  }

  if (
    /(rejected|blocked|failed|critical)/.test(v)
  ) {
    return "status-danger";
  }

  return "status-neutral";
}