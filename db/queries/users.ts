import { query } from "../pool";
import type { PublicUser, User, UserRole } from "../types";

export async function createUser(input: {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role?: UserRole;
}): Promise<PublicUser> {
  const { rows } = await query<PublicUser>(
    `INSERT INTO users (name, email, phone, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, phone, role, created_at`,
    [input.name, input.email, input.phone ?? null, input.passwordHash, input.role ?? "driver"]
  );
  return rows[0];
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { rows } = await query<User>(`SELECT * FROM users WHERE email = $1`, [email]);
  return rows[0] ?? null;
}

export async function getUserById(id: number): Promise<PublicUser | null> {
  const { rows } = await query<PublicUser>(
    `SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function listUsers(): Promise<PublicUser[]> {
  const { rows } = await query<PublicUser>(
    `SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC`
  );
  return rows;
}
