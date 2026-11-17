import { query, withTransaction } from "../pool";
import type { Reservation, ReservationDetails, SlotStatus } from "../types";

// Creates a reservation only if the slot has no overlapping confirmed booking
export async function createReservation(input: {
  userId: number;
  vehicleId: number;
  slotId: number;
  startTime: Date | string;
  endTime: Date | string;
}): Promise<Reservation> {
  return withTransaction(async (client) => {
    // Lock the slot row so concurrent bookings are serialized
    const slot = await client.query<{ id: number; status: SlotStatus }>(
      `SELECT id, status FROM parking_slots WHERE id = $1 FOR UPDATE`,
      [input.slotId]
    );
    if (!slot.rows[0]) throw new Error("Slot not found");
    if (slot.rows[0].status === "maintenance") throw new Error("Slot under maintenance");

    const overlap = await client.query(
      `SELECT 1 FROM reservations
       WHERE slot_id = $1 AND status = 'confirmed'
         AND start_time < $3 AND end_time > $2
       LIMIT 1`,
      [input.slotId, input.startTime, input.endTime]
    );
    if ((overlap.rowCount ?? 0) > 0) throw new Error("Slot already reserved for that time");

    const { rows } = await client.query<Reservation>(
      `INSERT INTO reservations (user_id, vehicle_id, slot_id, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [input.userId, input.vehicleId, input.slotId, input.startTime, input.endTime]
    );
    return rows[0];
  });
}

export async function getReservationsByUser(userId: number): Promise<ReservationDetails[]> {
  const { rows } = await query<ReservationDetails>(
    `SELECT r.*, s.slot_number, l.name AS lot_name, v.plate_number
     FROM reservations r
     JOIN parking_slots s ON s.id = r.slot_id
     JOIN parking_lots  l ON l.id = s.lot_id
     JOIN vehicles      v ON v.id = r.vehicle_id
     WHERE r.user_id = $1
     ORDER BY r.start_time DESC`,
    [userId]
  );
  return rows;
}

export async function cancelReservation(id: number, userId: number): Promise<Reservation | null> {
  const { rows } = await query<Reservation>(
    `UPDATE reservations SET status = 'cancelled'
     WHERE id = $1 AND user_id = $2 AND status = 'confirmed' RETURNING *`,
    [id, userId]
  );
  return rows[0] ?? null;
}

export async function expireOldReservations(): Promise<number> {
  const { rowCount } = await query(
    `UPDATE reservations SET status = 'expired'
     WHERE status = 'confirmed' AND end_time < NOW()`
  );
  return rowCount ?? 0;
}
