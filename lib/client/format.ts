const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

export const money = (v: string | number | null | undefined) => inr.format(Number(v ?? 0));

export const dateTime = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

export const dateOnly = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

/** "2h 05m" between two instants (defaults to now). */
export function duration(fromIso: string, toIso?: string | null, nowMs = Date.now()): string {
  const end = toIso ? new Date(toIso).getTime() : nowMs;
  const mins = Math.max(0, Math.floor((end - new Date(fromIso).getTime()) / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

/** Mirrors the server's billing: started hours, minimum 1. */
export function estimateFee(entryIso: string, hourlyRate: string | number, nowMs = Date.now()): number {
  const hours = Math.max(1, Math.ceil((nowMs - new Date(entryIso).getTime()) / 3_600_000));
  return hours * Number(hourlyRate);
}

/** Value for <input type="datetime-local"> in the user's local time. */
export function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const homeFor = (role: "driver" | "attendant" | "admin") =>
  role === "admin" ? "/admin" : role === "attendant" ? "/staff" : "/";
