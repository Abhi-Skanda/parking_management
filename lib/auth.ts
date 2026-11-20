import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ApiError } from "./api";
import type { UserRole } from "@/db/types";

const COOKIE_NAME = "parking_token";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
const ROLES: UserRole[] = ["driver", "attendant", "admin"];

export interface SessionUser {
  id: number;
  role: UserRole;
}

function secretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set and at least 32 characters long");
  }
  return new TextEncoder().encode(secret);
}

// ---------- passwords ----------
export const hashPassword = (password: string) => bcrypt.hash(password, 10);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

// Compared against when the email doesn't exist, so response time doesn't reveal valid emails
export const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", 10);

// ---------- tokens + cookie ----------
export async function signToken(user: SessionUser): Promise<string> {
  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

export async function setAuthCookie(token: string) {
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAuthCookie() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    const id = Number(payload.sub);
    const role = payload.role as UserRole;
    if (!Number.isInteger(id) || !ROLES.includes(role)) return null;
    return { id, role };
  } catch {
    return null;
  }
}

/** Throws 401 if not logged in, 403 if the role isn't allowed. */
export async function requireUser(roles?: UserRole[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, "Authentication required");
  if (roles && !roles.includes(user.role)) throw new ApiError(403, "You don't have permission to do this");
  return user;
}

export const isStaff = (user: SessionUser) => user.role === "admin" || user.role === "attendant";
