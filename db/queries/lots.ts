import { query } from "../pool";
import type { LotWithAvailability, ParkingLot } from "../types";

export async function createLot(input: {
  name: string;
  address: string;
  city: string;
  hourlyRate: number;
}): Promise<ParkingLot> {
  const { rows } = await query<ParkingLot>(
    `INSERT INTO parking_lots (name, address, city, hourly_rate)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [input.name, input.address, input.city, input.hourlyRate]
  );
  return rows[0];
}

// Lots with live availability counts (active only, unless includeInactive is true)
export async function listLotsWithAvailability(includeInactive = false): Promise<LotWithAvailability[]> {
  const { rows } = await query<LotWithAvailability>(
    `SELECT l.*,
            COUNT(s.id)::int                                       AS total_slots,
            COUNT(s.id) FILTER (WHERE s.status = 'available')::int AS available_slots,
            COUNT(s.id) FILTER (WHERE s.status = 'occupied')::int  AS occupied_slots
     FROM parking_lots l
     LEFT JOIN parking_slots s ON s.lot_id = l.id
     WHERE ($1::boolean OR l.is_active = TRUE)
     GROUP BY l.id
     ORDER BY l.name`,
    [includeInactive]
  );
  return rows;
}

export async function getLotById(id: number): Promise<ParkingLot | null> {
  const { rows } = await query<ParkingLot>(`SELECT * FROM parking_lots WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

export async function updateLotRate(id: number, hourlyRate: number): Promise<ParkingLot | null> {
  const { rows } = await query<ParkingLot>(
    `UPDATE parking_lots SET hourly_rate = $2 WHERE id = $1 RETURNING *`,
    [id, hourlyRate]
  );
  return rows[0] ?? null;
}

export async function setLotActive(id: number, isActive: boolean): Promise<ParkingLot | null> {
  const { rows } = await query<ParkingLot>(
    `UPDATE parking_lots SET is_active = $2 WHERE id = $1 RETURNING *`,
    [id, isActive]
  );
  return rows[0] ?? null;
}
