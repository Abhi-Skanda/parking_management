"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { api, errorMessage } from "@/lib/client/http";
import { dateTime, duration, estimateFee, money } from "@/lib/client/format";
import type { PaymentDTO, SessionDTO, SessionDetailsDTO } from "@/lib/client/types";

/** An active parking session with a live timer and running estimate. */
export function SessionCard({
  session,
  hourlyRate,
  onCheckedOut,
}: {
  session: SessionDetailsDTO;
  hourlyRate?: string;
  onCheckedOut: (result: { session: SessionDTO; payment: PaymentDTO | null }) => void;
}) {
  const toast = useToast();
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  async function checkOut() {
    setBusy(true);
    try {
      const result = await api<{ session: SessionDTO; payment: PaymentDTO | null }>(
        `/sessions/${session.id}/checkout`,
        { method: "POST" }
      );
      toast(`Checked out. Amount due: ${money(result.session.amount)}`);
      onCheckedOut(result);
    } catch (e) {
      toast(errorMessage(e), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border-indigo-200 bg-indigo-50/40">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">Currently parked</p>
          <h3 className="mt-1 text-lg font-semibold">
            {session.lot_name} · Slot {session.slot_number}
          </h3>
          <p className="text-sm text-slate-600">
            {session.plate_number} · since {dateTime(session.entry_time)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold">{duration(session.entry_time, null, now)}</p>
          {hourlyRate && (
            <p className="text-sm text-slate-500">≈ {money(estimateFee(session.entry_time, hourlyRate, now))} so far</p>
          )}
        </div>
      </div>
      <Button className="mt-4" loading={busy} onClick={checkOut}>
        Check out &amp; get bill
      </Button>
    </Card>
  );
}
