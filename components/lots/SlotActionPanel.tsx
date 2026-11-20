"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Feedback";
import { StatusBadge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { useQuery } from "@/hooks/useQuery";
import { api, errorMessage } from "@/lib/client/http";
import { money, toLocalInput } from "@/lib/client/format";
import type { ParkingLotDTO, SlotDTO, VehicleDTO } from "@/lib/client/types";

interface Props {
  lot: ParkingLotDTO;
  slot: SlotDTO;
  onDone: () => void;
}

/** Render with key={slot.id} so its state resets when another slot is picked. */
export function SlotActionPanel({ lot, slot, onDone }: Props) {
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const staff = user?.role !== "driver";

  const vehicles = useQuery<VehicleDTO[]>(staff ? null : "/vehicles");
  const [mode, setMode] = useState<"park" | "reserve">("park");
  const [vehicleId, setVehicleId] = useState("");
  const [plate, setPlate] = useState("");
  const [start, setStart] = useState(() => toLocalInput(new Date()));
  const [end, setEnd] = useState(() => toLocalInput(new Date(Date.now() + 2 * 3_600_000)));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canPark = slot.status === "available" || slot.status === "reserved";
  const canReserve = slot.status !== "maintenance";
  const chosenVehicle = vehicleId || String(vehicles.data?.[0]?.id ?? "");
  const effectiveMode = canPark ? mode : "reserve";

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const checkIn = () =>
    run(async () => {
      await api("/sessions", {
        method: "POST",
        body: staff
          ? { plateNumber: plate, slotId: slot.id }
          : { vehicleId: Number(chosenVehicle), slotId: slot.id },
      });
      toast(`Checked in to slot ${slot.slot_number}`);
      if (staff) {
        setPlate("");
        onDone();
      } else {
        router.push("/sessions");
      }
    });

  const reserve = () =>
    run(async () => {
      await api("/reservations", {
        method: "POST",
        body: {
          vehicleId: Number(chosenVehicle),
          slotId: slot.id,
          startTime: new Date(start).toISOString(),
          endTime: new Date(end).toISOString(),
        },
      });
      toast(`Slot ${slot.slot_number} reserved`);
      router.push("/reservations");
    });

  const setStatus = (status: "available" | "reserved" | "maintenance") =>
    run(async () => {
      await api(`/slots/${slot.id}`, { method: "PATCH", body: { status } });
      toast(`Slot ${slot.slot_number} marked ${status}`);
      onDone();
    });

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">Slot {slot.slot_number}</h3>
          <p className="text-sm capitalize text-slate-500">
            {slot.slot_type} · {money(lot.hourly_rate)}/hr
          </p>
        </div>
        <StatusBadge status={slot.status} />
      </div>

      {error && <Alert>{error}</Alert>}

      {/* ---------- driver ---------- */}
      {!staff && vehicles.data && vehicles.data.length === 0 && (
        <Alert tone="info">
          Add a vehicle first.{" "}
          <Link href="/vehicles" className="font-medium underline">
            Go to My vehicles
          </Link>
        </Alert>
      )}

      {!staff && vehicles.data && vehicles.data.length > 0 && (
        <>
          {slot.status === "maintenance" ? (
            <p className="text-sm text-slate-500">This slot is under maintenance.</p>
          ) : (
            <>
              {canPark && canReserve && (
                <div className="flex rounded-lg bg-slate-100 p-1 text-sm">
                  {(["park", "reserve"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`flex-1 rounded-md px-3 py-1.5 font-medium ${
                        effectiveMode === m ? "bg-white shadow-sm" : "text-slate-500"
                      }`}
                    >
                      {m === "park" ? "Park now" : "Reserve"}
                    </button>
                  ))}
                </div>
              )}
              {!canPark && (
                <p className="text-sm text-slate-500">
                  This slot isn&apos;t free right now, but you can reserve it for later.
                </p>
              )}

              <Select label="Vehicle" value={chosenVehicle} onChange={(e) => setVehicleId(e.target.value)}>
                {vehicles.data.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plate_number} · {v.type}
                  </option>
                ))}
              </Select>

              {effectiveMode === "reserve" && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input label="From" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
                  <Input label="Until" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
                </div>
              )}

              {effectiveMode === "park" ? (
                <Button className="w-full" loading={busy} onClick={checkIn}>
                  Check in now
                </Button>
              ) : (
                <Button className="w-full" loading={busy} onClick={reserve}>
                  Reserve slot
                </Button>
              )}
            </>
          )}
        </>
      )}

      {/* ---------- staff ---------- */}
      {staff && (
        <>
          {canPark && (
            <div className="space-y-3">
              <Input
                label="Vehicle plate number"
                placeholder="KA01AB1234"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
              />
              <Button className="w-full" loading={busy} disabled={plate.trim().length < 3} onClick={checkIn}>
                Check in vehicle
              </Button>
            </div>
          )}
          {slot.status === "occupied" && (
            <p className="text-sm text-slate-500">Occupied. Check the vehicle out from the Gate page.</p>
          )}
          {slot.status !== "occupied" && (
            <div className="border-t border-slate-100 pt-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Set slot status</p>
              <div className="flex flex-wrap gap-2">
                {(["available", "reserved", "maintenance"] as const)
                  .filter((s) => s !== slot.status)
                  .map((s) => (
                    <Button key={s} variant="secondary" size="sm" disabled={busy} onClick={() => setStatus(s)}>
                      Mark {s}
                    </Button>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
