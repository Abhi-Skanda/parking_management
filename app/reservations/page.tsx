"use client";

import Link from "next/link";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState, QueryBoundary } from "@/components/ui/Feedback";
import { useToast } from "@/components/ui/Toast";
import { useQuery } from "@/hooks/useQuery";
import { api, errorMessage } from "@/lib/client/http";
import { dateTime } from "@/lib/client/format";
import type { ReservationDTO } from "@/lib/client/types";

export default function ReservationsPage() {
  return (
    <RequireAuth roles={["driver"]}>
      <Reservations />
    </RequireAuth>
  );
}

function Reservations() {
  const toast = useToast();
  const reservations = useQuery<ReservationDTO[]>("/reservations");

  async function cancel(r: ReservationDTO) {
    if (!window.confirm("Cancel this reservation?")) return;
    try {
      await api(`/reservations/${r.id}`, { method: "DELETE" });
      toast("Reservation cancelled");
      reservations.reload();
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  }

  return (
    <>
      <PageHeader
        title="Reservations"
        subtitle="Your booked slots."
        action={<Link href="/lots" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Reserve a slot</Link>}
      />
      <QueryBoundary query={reservations}>
        {(data) =>
          data.length === 0 ? (
            <EmptyState title="No reservations yet" hint="Pick a lot and reserve a slot ahead of time." />
          ) : (
            <div className="space-y-3">
              {data.map((r) => (
                <Card key={r.id} className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{r.lot_name} · Slot {r.slot_number}</p>
                    <p className="text-sm text-slate-500">
                      {r.plate_number} · {dateTime(r.start_time)} → {dateTime(r.end_time)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={r.status} />
                    {r.status === "confirmed" && (
                      <Button variant="secondary" size="sm" onClick={() => cancel(r)}>Cancel</Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )
        }
      </QueryBoundary>
    </>
  );
}
