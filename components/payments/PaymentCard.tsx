"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { api, errorMessage } from "@/lib/client/http";
import { dateTime, money } from "@/lib/client/format";
import type { PaymentMethod, PendingPaymentDTO } from "@/lib/client/types";

export function PaymentCard({ payment, onPaid }: { payment: PendingPaymentDTO; onPaid: () => void }) {
  const toast = useToast();
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [busy, setBusy] = useState(false);

  async function pay() {
    setBusy(true);
    try {
      await api(`/payments/${payment.id}/pay`, { method: "POST", body: { method } });
      toast(`Paid ${money(payment.amount)}. Thank you!`);
      onPaid();
    } catch (e) {
      toast(errorMessage(e), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-2xl font-semibold">{money(payment.amount)}</p>
        <p className="text-sm text-slate-500">
          {payment.plate_number} · billed {dateTime(payment.created_at)}
        </p>
      </div>
      <div className="flex items-end gap-3">
        <Select label="Method" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
          <option value="upi">UPI</option>
          <option value="card">Card</option>
          <option value="wallet">Wallet</option>
          <option value="cash">Cash</option>
        </Select>
        <Button loading={busy} onClick={pay}>
          Pay now
        </Button>
      </div>
    </Card>
  );
}
