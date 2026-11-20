"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Feedback";
import { useToast } from "@/components/ui/Toast";
import { api, errorMessage } from "@/lib/client/http";
import type { VehicleType } from "@/lib/client/types";

export function VehicleForm({ onAdded }: { onAdded: () => void }) {
  const toast = useToast();
  const [plateNumber, setPlate] = useState("");
  const [type, setType] = useState<VehicleType>("car");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/vehicles", {
        method: "POST",
        body: { plateNumber, type, make: make || undefined, model: model || undefined },
      });
      toast("Vehicle added");
      setPlate("");
      setMake("");
      setModel("");
      onAdded();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <h2 className="mb-4 font-semibold">Add a vehicle</h2>
      <form onSubmit={submit} className="space-y-3">
        {error && <Alert>{error}</Alert>}
        <Input label="Plate number" required placeholder="KA01AB1234" value={plateNumber} onChange={(e) => setPlate(e.target.value)} />
        <Select label="Type" value={type} onChange={(e) => setType(e.target.value as VehicleType)}>
          <option value="car">Car</option>
          <option value="suv">SUV</option>
          <option value="bike">Bike</option>
          <option value="ev">EV</option>
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Make (optional)" value={make} onChange={(e) => setMake(e.target.value)} />
          <Input label="Model (optional)" value={model} onChange={(e) => setModel(e.target.value)} />
        </div>
        <Button type="submit" loading={busy} className="w-full">
          Add vehicle
        </Button>
      </form>
    </Card>
  );
}
