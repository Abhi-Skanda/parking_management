"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { SlotGrid, SlotLegend } from "@/components/lots/SlotGrid";
import { SlotActionPanel } from "@/components/lots/SlotActionPanel";
import { Card, PageHeader } from "@/components/ui/Card";
import { Alert, EmptyState, PageSpinner } from "@/components/ui/Feedback";
import { useQuery } from "@/hooks/useQuery";
import { money } from "@/lib/client/format";
import type { ParkingLotDTO, SlotDTO, SlotType } from "@/lib/client/types";

export default function LotDetailPage() {
  return (
    <RequireAuth>
      <LotDetail />
    </RequireAuth>
  );
}

const filters: { value: SlotType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "regular", label: "Regular" },
  { value: "compact", label: "Compact" },
  { value: "ev", label: "EV" },
  { value: "disabled", label: "Accessible" },
];

function LotDetail() {
  const { id } = useParams<{ id: string }>();
  const lot = useQuery<ParkingLotDTO>(`/lots/${id}`);
  const slots = useQuery<SlotDTO[]>(`/lots/${id}/slots`);
  const [filter, setFilter] = useState<SlotType | "all">("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (lot.error && !lot.data) return <Alert>{lot.error}</Alert>;
  if (!lot.data || !slots.data) return <PageSpinner />;

  const all = slots.data;
  const visible = filter === "all" ? all : all.filter((s) => s.slot_type === filter);
  const selected = all.find((s) => s.id === selectedId) ?? null;
  const free = all.filter((s) => s.status === "available").length;

  return (
    <>
      <Link href="/lots" className="mb-3 inline-block text-sm text-indigo-600 hover:underline">← All lots</Link>
      <PageHeader
        title={lot.data.name}
        subtitle={`${lot.data.address}, ${lot.data.city} · ${money(lot.data.hourly_rate)}/hour · ${free} of ${all.length} free`}
      />
      {!lot.data.is_active && <div className="mb-4"><Alert>This lot is currently inactive.</Alert></div>}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`rounded-full border px-3 py-1 text-sm ${
                    filter === f.value ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <SlotLegend />
          </div>
          {visible.length === 0 ? (
            <EmptyState title="No slots of this type" />
          ) : (
            <SlotGrid slots={visible} selectedId={selectedId} onSelect={(s) => setSelectedId(s.id)} />
          )}
        </div>

        <div>
          {selected ? (
            <SlotActionPanel key={selected.id} lot={lot.data} slot={selected} onDone={slots.reload} />
          ) : (
            <Card className="text-center text-sm text-slate-500">Select a slot to park or reserve it.</Card>
          )}
        </div>
      </div>
    </>
  );
}
