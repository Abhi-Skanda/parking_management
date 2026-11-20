type Tone = "green" | "red" | "amber" | "slate" | "indigo";

const tones: Record<Tone, string> = {
  green: "bg-emerald-100 text-emerald-800",
  red: "bg-rose-100 text-rose-800",
  amber: "bg-amber-100 text-amber-800",
  slate: "bg-slate-100 text-slate-700",
  indigo: "bg-indigo-100 text-indigo-800",
};

export function Badge({ tone = "slate", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${tones[tone]}`}>
      {children}
    </span>
  );
}

const statusTone: Record<string, Tone> = {
  available: "green",
  confirmed: "indigo",
  active: "indigo",
  completed: "slate",
  paid: "green",
  occupied: "red",
  failed: "red",
  cancelled: "slate",
  expired: "slate",
  refunded: "amber",
  pending: "amber",
  reserved: "amber",
  maintenance: "slate",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={statusTone[status] ?? "slate"}>{status}</Badge>;
}
