"use client";

import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/RequireAuth";
import { SessionCard } from "@/components/sessions/SessionCard";
import { Card, PageHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState, QueryBoundary } from "@/components/ui/Feedback";
import { useQuery } from "@/hooks/useQuery";
import { dateTime, duration, money } from "@/lib/client/format";
import type { LotDTO, SessionDetailsDTO } from "@/lib/client/types";

export default function SessionsPage() {
  return (
    <RequireAuth roles={["driver"]}>
      <Sessions />
    </RequireAuth>
  );
}

function Sessions() {
  const router = useRouter();
  const sessions = useQuery<SessionDetailsDTO[]>("/sessions");
  const lots = useQuery<LotDTO[]>("/lots");

  return (
    <>
      <PageHeader title="My parking" subtitle="Active session and past history." />
      <QueryBoundary query={sessions}>
        {(data) => {
          const active = data.filter((s) => s.status === "active");
          const past = data.filter((s) => s.status === "completed");
          return (
            <div className="space-y-8">
              {active.length === 0 ? (
                <EmptyState title="You're not parked right now" hint="Find a lot and check in to start a session." />
              ) : (
                active.map((s) => (
                  <SessionCard
                    key={s.id}
                    session={s}
                    hourlyRate={lots.data?.find((l) => l.name === s.lot_name)?.hourly_rate}
                    onCheckedOut={() => router.push("/payments")}
                  />
                ))
              )}

              <section>
                <h2 className="mb-3 text-lg font-semibold">History</h2>
                {past.length === 0 ? (
                  <p className="text-sm text-slate-500">No completed sessions yet.</p>
                ) : (
                  <Card className="overflow-x-auto p-0">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Lot / Slot</th>
                          <th className="px-4 py-3">Vehicle</th>
                          <th className="px-4 py-3">Entered</th>
                          <th className="px-4 py-3">Duration</th>
                          <th className="px-4 py-3">Amount</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {past.map((s) => (
                          <tr key={s.id}>
                            <td className="px-4 py-3">{s.lot_name} · {s.slot_number}</td>
                            <td className="px-4 py-3">{s.plate_number}</td>
                            <td className="px-4 py-3 text-slate-500">{dateTime(s.entry_time)}</td>
                            <td className="px-4 py-3">{duration(s.entry_time, s.exit_time)}</td>
                            <td className="px-4 py-3 font-medium">{money(s.amount)}</td>
                            <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>
                )}
              </section>
            </div>
          );
        }}
      </QueryBoundary>
    </>
  );
}
