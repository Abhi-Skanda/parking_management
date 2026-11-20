"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { Alert, EmptyState, QueryBoundary } from "@/components/ui/Feedback";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { useQuery } from "@/hooks/useQuery";
import { api, errorMessage } from "@/lib/client/http";
import type { LotDTO, SlotType } from "@/lib/client/types";

function CreateLotForm({ onCreated }: { onCreated: () => void }) {
  const toast = useToast();
  const [f, setF] = useState({ name: "", address: "", city: "", hourlyRate: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/lots", { method: "POST", body: { ...f, hourlyRate: Number(f.hourlyRate) } });
      toast("Lot created");
      setF({ name: "", address: "", city: "", hourlyRate: "" });
      onCreated();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <h3 className="mb-4 font-semibold">Create a lot</h3>
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
        {error && <div className="sm:col-span-2"><Alert>{error}</Alert></div>}
        <Input label="Name" required value={f.name} onChange={set("name")} />
        <Input label="City" required value={f.city} onChange={set("city")} />
        <Input label="Address" required value={f.address} onChange={set("address")} />
        <Input label="Hourly rate (₹)" required type="number" min="0" step="0.5" value={f.hourlyRate} onChange={set("hourlyRate")} />
        <div className="sm:col-span-2">
          <Button type="submit" loading={busy}>Create lot</Button>
        </div>
      </form>
    </Card>
  );
}

function LotAdminCard({ lot, onChanged }: { lot: LotDTO; onChanged: () => void }) {
  const toast = useToast();
  const [rate, setRate] = useState(lot.hourly_rate);
  const [slotNumber, setSlotNumber] = useState("");
  const [slotType, setSlotType] = useState<SlotType>("regular");
  const [busy, setBusy] = useState<string | null>(null);

  async function act(key: string, fn: () => Promise<unknown>, success: string) {
    setBusy(key);
    try {
      await fn();
      toast(success);
      onChanged();
    } catch (e) {
      toast(errorMessage(e), "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{lot.name}</h3>
            <Badge tone={lot.is_active ? "green" : "slate"}>{lot.is_active ? "active" : "inactive"}</Badge>
          </div>
          <p className="text-sm text-slate-500">
            {lot.address}, {lot.city} · {lot.total_slots} slots ({lot.available_slots} free, {lot.occupied_slots} occupied)
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/lots/${lot.id}`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Manage slots
          </Link>
          <Button
            size="sm"
            variant={lot.is_active ? "danger" : "primary"}
            loading={busy === "active"}
            onClick={() =>
              act("active", () => api(`/lots/${lot.id}`, { method: "PATCH", body: { isActive: !lot.is_active } }),
                lot.is_active ? "Lot deactivated" : "Lot activated")
            }
          >
            {lot.is_active ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
        <div className="flex items-end gap-2">
          <Input label="Hourly rate (₹)" type="number" min="0" step="0.5" value={rate} onChange={(e) => setRate(e.target.value)} className="flex-1" />
          <Button
            variant="secondary"
            loading={busy === "rate"}
            disabled={rate === lot.hourly_rate || rate === ""}
            onClick={() => act("rate", () => api(`/lots/${lot.id}`, { method: "PATCH", body: { hourlyRate: Number(rate) } }), "Rate updated")}
          >
            Save
          </Button>
        </div>
        <div className="flex items-end gap-2">
          <Input label="New slot" placeholder="B1" value={slotNumber} onChange={(e) => setSlotNumber(e.target.value)} className="w-24" />
          <Select label="Type" value={slotType} onChange={(e) => setSlotType(e.target.value as SlotType)} className="flex-1">
            <option value="regular">Regular</option>
            <option value="compact">Compact</option>
            <option value="ev">EV</option>
            <option value="disabled">Accessible</option>
          </Select>
          <Button
            variant="secondary"
            loading={busy === "slot"}
            disabled={!slotNumber.trim()}
            onClick={() =>
              act("slot", async () => {
                await api(`/lots/${lot.id}/slots`, { method: "POST", body: { slotNumber, slotType } });
                setSlotNumber("");
              }, "Slot added")
            }
          >
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function LotsPanel() {
  const lots = useQuery<LotDTO[]>("/lots?includeInactive=true");
  return (
    <div className="space-y-4">
      <CreateLotForm onCreated={lots.reload} />
      <QueryBoundary query={lots}>
        {(data) =>
          data.length === 0 ? (
            <EmptyState title="No lots yet" hint="Create your first lot above." />
          ) : (
            data.map((l) => <LotAdminCard key={`${l.id}-${l.hourly_rate}-${l.total_slots}`} lot={l} onChanged={lots.reload} />)
          )
        }
      </QueryBoundary>
    </div>
  );
}
