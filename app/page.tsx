"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/components/AuthProvider";
import { LotCard } from "@/components/lots/LotCard";
import { SessionCard } from "@/components/sessions/SessionCard";
import { Card, PageHeader } from "@/components/ui/Card";
import { EmptyState, QueryBoundary } from "@/components/ui/Feedback";
import { StatCard } from "@/components/ui/StatCard";
import { useQuery } from "@/hooks/useQuery";
import { money } from "@/lib/client/format";
import type { LotDTO, PendingPaymentDTO, ReservationDTO, SessionDetailsDTO } from "@/lib/client/types";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const sessions = useQuery<SessionDetailsDTO[]>("/sessions");
  const payments = useQuery<PendingPaymentDTO[]>("/payments");
  const reservations = useQuery<ReservationDTO[]>("/reservations");
  const lots = useQuery<LotDTO[]>("/lots");

  const active = sessions.data?.filter((s) => s.status === "active") ?? [];
  const upcoming =
    reservations.data?.filter((r) => r.status === "confirmed" && new Date(r.end_time) > new Date()) ?? [];
  const due = payments.data?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;
  const staff = user?.role !== "driver";

  return (
    <div className="space-y-8">
      <PageHeader title={`Welcome back, ${user?.name.split(" ")[0]}`} subtitle="Here's what's happening with your parking." />

      {staff && (
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">You&apos;re signed in as {user?.role}. Jump to your tools:</p>
          <div className="flex gap-2">
            <Link href="/staff" className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">Gate</Link>
            {user?.role === "admin" && (
              <Link href="/admin" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50">Admin</Link>
            )}
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Currently parked" value={active.length} />
        <StatCard label="Upcoming reservations" value={upcoming.length} />
        <StatCard label="Amount due" value={money(due)} hint={payments.data?.length ? `${payments.data.length} unpaid bill(s)` : "All settled"} />
      </div>

      {active.map((s) => (
        <SessionCard
          key={s.id}
          session={s}
          hourlyRate={lots.data?.find((l) => l.name === s.lot_name)?.hourly_rate}
          onCheckedOut={() => router.push("/payments")}
        />
      ))}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Parking lots near you</h2>
          <Link href="/lots" className="text-sm font-medium text-indigo-600 hover:underline">See all</Link>
        </div>
        <QueryBoundary query={lots}>
          {(data) =>
            data.length === 0 ? (
              <EmptyState title="No lots available yet" />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.slice(0, 3).map((l) => <LotCard key={l.id} lot={l} />)}
              </div>
            )
          }
        </QueryBoundary>
      </section>
    </div>
  );
}
