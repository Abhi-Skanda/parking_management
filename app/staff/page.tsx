"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { GateCheckIn } from "@/components/staff/GateCheckIn";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, QueryBoundary } from "@/components/ui/Feedback";
import { useToast } from "@/components/ui/Toast";
import { useQuery } from "@/hooks/useQuery";
import { api, errorMessage } from "@/lib/client/http";
import { dateTime, duration, money } from "@/lib/client/format";
import type { PaymentDTO, PaymentMethod, SessionDTO, SessionDetailsDTO } from "@/lib/client/types";

export default function StaffPage() {
  return (
    <RequireAuth roles={["attendant", "admin"]}>
      <Gate />
    </RequireAuth>
  );
}

function Gate() {
  const toast = useToast();
  const active = useQuery<SessionDetailsDTO[]>("/sessions?scope=active");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [settle, setSettle] = useState<{ payment: PaymentDTO; plate: string } | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [paying, setPaying] = useState(false);

  async function checkOut(s: SessionDetailsDTO) {
    setBusyId(s.id);
    try {
      const r = await api<{ session: SessionDTO; payment: PaymentDTO | null }>(`/sessions/${s.id}/checkout`, { method: "POST" });
      active.reload();
      if (r.payment) setSettle({ payment: r.payment, plate: s.plate_number });
    } catch (e) {
      toast(errorMessage(e), "error");
    } finally {
      setBusyId(null);
    }
  }

  async function collect() {
    if (!settle) return;
    setPaying(true);
    try {
      await api(`/payments/${settle.payment.id}/pay`, { method: "POST", body: { method } });
      toast(`Collected ${money(settle.payment.amount)} from ${settle.plate}`);
      setSettle(null);
    } catch (e) {
      toast(errorMessage(e), "error");
    } finally {
      setPaying(false);
    }
  }

  return (
    <>
      <PageHeader title="Gate" subtitle="Check vehicles in and out, and collect payment." />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section>
          <h2 className="mb-3 text-lg font-semibold">Vehicles inside</h2>
          <QueryBoundary query={active}>
            {(data) =>
              data.length === 0 ? (
                <EmptyState title="No vehicles parked" />
              ) : (
                <Card className="overflow-x-auto p-0">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Plate</th>
                        <th className="px-4 py-3">Lot / Slot</th>
                        <th className="px-4 py-3">Entered</th>
                        <th className="px-4 py-3">Time</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.map((s) => (
                        <tr key={s.id}>
                          <td className="px-4 py-3 font-semibold">{s.plate_number}</td>
                          <td className="px-4 py-3">{s.lot_name} · {s.slot_number}</td>
                          <td className="px-4 py-3 text-slate-500">{dateTime(s.entry_time)}</td>
                          <td className="px-4 py-3">{duration(s.entry_time)}</td>
                          <td className="px-4 py-3 text-right">
                            <Button size="sm" loading={busyId === s.id} onClick={() => checkOut(s)}>Check out</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )
            }
          </QueryBoundary>
        </section>

        <GateCheckIn onCheckedIn={active.reload} />
      </div>

      <Modal open={settle !== null} onClose={() => setSettle(null)} title="Collect payment">
        {settle && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-500">{settle.plate}</p>
              <p className="text-3xl font-semibold">{money(settle.payment.amount)}</p>
            </div>
            <Select label="Payment method" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="wallet">Wallet</option>
            </Select>
            <div className="flex gap-2">
              <Button className="flex-1" loading={paying} onClick={collect}>Mark as paid</Button>
              <Button variant="secondary" onClick={() => setSettle(null)}>Later</Button>
            </div>
            <p className="text-xs text-slate-400">If you choose &quot;Later&quot;, the driver can still pay from their Payments page.</p>
          </div>
        )}
      </Modal>
    </>
  );
}
