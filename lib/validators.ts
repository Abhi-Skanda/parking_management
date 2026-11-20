import { z } from "zod";

const id = z.number().int().positive();
const slotType = z.enum(["regular", "compact", "ev", "disabled"]);
const vehicleType = z.enum(["bike", "car", "suv", "ev"]);
const paymentMethod = z.enum(["cash", "card", "upi", "wallet"]);

// ---------- auth ----------
export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(150),
  phone: z.string().trim().min(7).max(20).optional(),
  password: z.string().min(8).max(72), // bcrypt ignores bytes past 72
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const createStaffSchema = registerSchema.extend({
  role: z.enum(["attendant", "admin"]),
});

// ---------- vehicles ----------
export const vehicleSchema = z.object({
  plateNumber: z.string().trim().min(3).max(20),
  type: vehicleType.optional(),
  make: z.string().trim().max(50).optional(),
  model: z.string().trim().max(50).optional(),
});

// ---------- lots & slots ----------
export const createLotSchema = z.object({
  name: z.string().trim().min(2).max(100),
  address: z.string().trim().min(3),
  city: z.string().trim().min(2).max(80),
  hourlyRate: z.number().nonnegative().max(100000),
});

export const patchLotSchema = z
  .object({
    hourlyRate: z.number().nonnegative().max(100000).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((d) => d.hourlyRate !== undefined || d.isActive !== undefined, {
    message: "Provide hourlyRate and/or isActive",
  });

export const createSlotSchema = z.object({
  slotNumber: z.string().trim().min(1).max(10),
  slotType: slotType.optional(),
});

export const slotsQuerySchema = z.object({
  available: z.enum(["true", "false"]).optional(),
  type: slotType.optional(),
});

// 'occupied' is only ever set by check-in
export const slotStatusSchema = z.object({
  status: z.enum(["available", "reserved", "maintenance"]),
});

// ---------- reservations ----------
export const reservationSchema = z
  .object({
    vehicleId: id,
    slotId: id,
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
  })
  .refine((d) => d.endTime > d.startTime, { message: "endTime must be after startTime", path: ["endTime"] })
  .refine((d) => d.endTime > new Date(), { message: "Reservation must end in the future", path: ["endTime"] });

// ---------- sessions & payments ----------
export const checkInSchema = z
  .object({
    vehicleId: id.optional(),
    plateNumber: z.string().trim().min(3).max(20).optional(),
    slotId: id,
  })
  .refine((d) => (d.vehicleId !== undefined) !== (d.plateNumber !== undefined), {
    message: "Provide either vehicleId or plateNumber",
  });

export const sessionsQuerySchema = z.object({
  scope: z.enum(["mine", "active"]).optional(),
});

export const paySchema = z.object({ method: paymentMethod });

export const revenueQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});
