"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { VehicleForm } from "@/components/vehicles/VehicleForm";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, QueryBoundary } from "@/components/ui/Feedback";
import { useToast } from "@/components/ui/Toast";
import { useQuery } from "@/hooks/useQuery";
import { api, errorMessage } from "@/lib/client/http";
import type { VehicleDTO } from "@/lib/client/types";

export default function VehiclesPage() {
  return (
    <RequireAuth roles={["driver"]}>
      <Vehicles />
    </RequireAuth>
  );
}

function Vehicles() {
  const toast = useToast();
  const vehicles = useQuery<VehicleDTO[]>("/vehicles");

  async function remove(v: VehicleDTO) {
    if (!window.confirm(`Remove ${v.plate_number}?`)) return;
    try {
      await api(`/vehicles/${v.id}`, { method: "DELETE" });
      toast("Vehicle removed");
      vehicles.reload();
    } catch (e) {
      toast(errorMessage(e), "error");
    }
  }

  return (
    <>
      <PageHeader title="My vehicles" subtitle="Vehicles you can park or reserve with." />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <QueryBoundary query={vehicles}>
          {(data) =>
            data.length === 0 ? (
              <EmptyState title="No vehicles yet" hint="Add your first vehicle to start parking." />
            ) : (
              <div className="grid content-start gap-3 sm:grid-cols-2">
                {data.map((v) => (
                  <Card key={v.id} className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-semibold tracking-wide">{v.plate_number}</p>
                      <p className="text-sm text-slate-500">{[v.make, v.model].filter(Boolean).join(" ") || "—"}</p>
                      <div className="mt-2"><Badge tone="indigo">{v.type}</Badge></div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => remove(v)}>Remove</Button>
                  </Card>
                ))}
              </div>
            )
          }
        </QueryBoundary>
        <VehicleForm onAdded={vehicles.reload} />
      </div>
    </>
  );
}
