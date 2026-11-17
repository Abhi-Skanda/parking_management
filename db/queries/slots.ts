import { query } from "../pool";
import type { ParkingSlot, SlotStatus, SlotType } from "../types";

export async function createSlot(input: {
  lotId: number;
  slotNumber: string;
  slotType?: SlotType;
}): Promise<ParkingSlot> {
  const { rows } = await query<ParkingSlot>(
    `INSERT INTO parking_slots (lot_id, slot_number, slot_type)
     VALUES ($1, $2, $3) RETURNING *`,
    [input.lotId, input.slotNumber, input.slotType ?? "regular"]
  );
  return rows[0];
}

export async function getSlotsByLot(lotId: number): Promise<ParkingSlot[]> {
  const { rows } = await query<ParkingSlot>(
    `SELECT * FROM parking_slots WHERE lot_id = $1 ORDER BY slot_number`,
    [lotId]
  );
  return rows;
}

export async function getAvailableSlots(lotId: number, slotType?: SlotType): Promise<ParkingSlot[]> {
  const { rows } = await query<ParkingSlot>(
    `SELECT * FROM parking_slots
     WHERE lot_id = $1 AND status = 'available'
       AND ($2::text IS NULL OR slot_type = $2)
     ORDER BY slot_number`,
    [lotId, slotType ?? null]
  );
  return rows;
}

export async function updateSlotStatus(id: number, status: SlotStatus): Promise<ParkingSlot | null> {
  const { rows } = await query<ParkingSlot>(
    `UPDATE parking_slots SET status = $2 WHERE id = $1 RETURNING *`,
    [id, status]
  );
  return rows[0] ?? null;
}
