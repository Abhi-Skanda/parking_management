import { query, withTransaction } from "../pool";
import type { ParkingSession, SessionDetails, SlotStatus } from "../types";

// Vehicle enters: occupy the slot and open a session
export async function checkIn(input: { vehicleId: number; slotId: number }): Promise<ParkingSession> {
  return withTransaction(async (client) => {
    const slot = await client.query<{ id: number; status: SlotStatus }>(
      `SELECT id, status FROM parking_slots WHERE id = $1 FOR UPDATE`,
      [input.slotId]
    );
    if (!slot.rows[0]) throw new Error("Slot not found");
    if (slot.rows[0].status === "occupied") throw new Error("Slot is occupied");
    if (slot.rows[0].status === "maintenance") throw new Error("Slot under maintenance");

    const { rows } = await client.query<ParkingSession>(
      `INSERT INTO parking_sessions (vehicle_id, slot_id) VALUES ($1, $2) RETURNING *`,
      [input.vehicleId, input.slotId]
    );
    await client.query(`UPDATE parking_slots SET status = 'occupied' WHERE id = $1`, [input.slotId]);
    return rows[0];
  });
}

// Vehicle leaves: bill by started hour (min 1h), free the slot, create a pending payment
export async function checkOut(sessionId: number): Promise<ParkingSession> {
  return withTransaction(async (client) => {
    const found = await client.query<{ hourly_rate: string }>(
      `SELECT l.hourly_rate
       FROM parking_sessions ps
       JOIN parking_slots s ON s.id = ps.slot_id
       JOIN parking_lots  l ON l.id = s.lot_id
       WHERE ps.id = $1 AND ps.status = 'active'
       FOR UPDATE OF ps`,
      [sessionId]
    );
    if (!found.rows[0]) throw new Error("Active session not found");

    const { rows } = await client.query<ParkingSession>(
      `UPDATE parking_sessions
       SET exit_time = NOW(),
           status = 'completed',
           amount = GREATEST(1, CEIL(EXTRACT(EPOCH FROM (NOW() - entry_time)) / 3600)) * $2
       WHERE id = $1
       RETURNING *`,
      [sessionId, found.rows[0].hourly_rate]
    );
    const done = rows[0];

    await client.query(`UPDATE parking_slots SET status = 'available' WHERE id = $1`, [done.slot_id]);
    await client.query(`INSERT INTO payments (session_id, amount) VALUES ($1, $2)`, [done.id, done.amount]);
    return done;
  });
}

export async function getActiveSessions(): Promise<SessionDetails[]> {
  const { rows } = await query<SessionDetails>(
    `SELECT ps.*, v.plate_number, s.slot_number, l.name AS lot_name
     FROM parking_sessions ps
     JOIN vehicles v      ON v.id = ps.vehicle_id
     JOIN parking_slots s ON s.id = ps.slot_id
     JOIN parking_lots l  ON l.id = s.lot_id
     WHERE ps.status = 'active'
     ORDER BY ps.entry_time DESC`
  );
  return rows;
}

export async function getSessionHistoryByUser(userId: number): Promise<SessionDetails[]> {
  const { rows } = await query<SessionDetails>(
    `SELECT ps.*, v.plate_number, s.slot_number, l.name AS lot_name
     FROM parking_sessions ps
     JOIN vehicles v      ON v.id = ps.vehicle_id
     JOIN parking_slots s ON s.id = ps.slot_id
     JOIN parking_lots l  ON l.id = s.lot_id
     WHERE v.user_id = $1
     ORDER BY ps.entry_time DESC`,
    [userId]
  );
  return rows;
}
