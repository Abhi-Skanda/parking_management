"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { PaymentCard } from "@/components/payments/PaymentCard";
import { PageHeader } from "@/components/ui/Card";
import { EmptyState, QueryBoundary } from "@/components/ui/Feedback";
import { useQuery } from "@/hooks/useQuery";
import type { PendingPaymentDTO } from "@/lib/client/types";

export default function PaymentsPage() {
  return (
    <RequireAuth roles={["driver"]}>
      <Payments />
    </RequireAuth>
  );
}

function Payments() {
  const payments = useQuery<PendingPaymentDTO[]>("/payments");
  return (
    <>
      <PageHeader title="Payments" subtitle="Bills waiting to be paid." />
      <QueryBoundary query={payments}>
        {(data) =>
          data.length === 0 ? (
            <EmptyState title="You're all paid up 🎉" hint="Bills appear here after you check out." />
          ) : (
            <div className="space-y-3">
              {data.map((p) => <PaymentCard key={p.id} payment={p} onPaid={payments.reload} />)}
            </div>
          )
        }
      </QueryBoundary>
    </>
  );
}
