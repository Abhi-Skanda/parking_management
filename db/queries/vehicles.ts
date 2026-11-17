import { query } from "../pool";
import type { Vehicle, VehicleType } from "../types";

export async function addVehicle(input: {
  userId: number;
  plateNumber: string;
  type?: VehicleType;
  make?: string;
  model?: string;
}): Promise<Vehicle> {
  const { rows } = await query<Vehicle>(
    `INSERT INTO vehicles (user_id, plate_number, type, make, model)
     VALUES ($1, UPPER($2), $3, $4, $5) RETURNING *`,
    [input.userId, input.plateNumber, input.type ?? "car", input.make ?? null, input.model ?? null]
  );
  return rows[0];
}

export async function getVehiclesByUser(userId: number): Promise<Vehicle[]> {
  const { rows } = await query<Vehicle>(
    `SELECT * FROM vehicles WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

export async function getVehicleByPlate(plateNumber: string): Promise<Vehicle | null> {
  const { rows } = await query<Vehicle>(
    `SELECT * FROM vehicles WHERE plate_number = UPPER($1)`,
    [plateNumber]
  );
  return rows[0] ?? null;
}

export async function deleteVehicle(id: number, userId: number): Promise<boolean> {
  const { rowCount } = await query(`DELETE FROM vehicles WHERE id = $1 AND user_id = $2`, [id, userId]);
  return (rowCount ?? 0) > 0;
}
