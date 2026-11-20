"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Feedback";
import { useToast } from "@/components/ui/Toast";
import { useQuery } from "@/hooks/useQuery";
import { api, errorMessage } from "@/lib/client/http";
import type { LotDTO, SlotDTO } from "@/lib/client/types";

/** Gate form: staff type a plate, pick a lot + free slot, and check the vehicle in. */
export function GateCheckIn({ onCheckedIn }: { onCheckedIn: () => void }) {
  const toast = useToast();
  const lots = useQuery<LotDTO[]>("/lots");
  const [lotId, setLotId] = useState("");
  const [slotId, setSlotId] = useState("");
  const [plate, setPlate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeLot = lotId || String(lots.data?.[0]?.id ?? "");
  const slots = useQuery<SlotDTO[]>(activeLot ? `/lots/${activeLot}/slots?available=true` : null);
  const activeSlot = slots.data?.some((s) => String(s.id) === slotId) ? slotId : String(slots.data?.[0]?.id ?? "");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/sessions", { method: "POST", body: { plateNumber: plate, slotId: Number(activeSlot) } });
      toast(`${plate.toUpperCase()} checked in`);
      setPlate("");
      setSlotId("");
      slots.reload();
      onCheckedIn();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <h2 className="mb-4 font-semibold">Gate check-in</h2>
      <form onSubmit={submit} className="space-y-3">
        {error && <Alert>{error}</Alert>}
        <Input label="Plate number" required placeholder="KA01AB1234" value={plate} onChange={(e) => setPlate(e.target.value)} />
        <Select label="Lot" value={activeLot} onChange={(e) => { setLotId(e.target.value); setSlotId(""); }}>
          {lots.data?.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name} ({l.available_slots} free)
            </option>
          ))}
        </Select>
        <Select label="Slot" value={activeSlot} onChange={(e) => setSlotId(e.target.value)} disabled={!slots.data?.length}>
          {slots.data?.length ? (
            slots.data.map((s) => (
              <option key={s.id} value={s.id}>
                {s.slot_number} · {s.slot_type}
              </option>
            ))
          ) : (
            <option value="">No free slots</option>
          )}
        </Select>
        <Button type="submit" className="w-full" loading={busy} disabled={!activeSlot || plate.trim().length < 3}>
          Check in
        </Button>
      </form>
    </Card>
  );
}
