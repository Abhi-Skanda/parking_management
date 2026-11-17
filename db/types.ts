// Row types. Note: pg returns NUMERIC columns as strings, so money fields are `string`.

export type UserRole = "driver" | "attendant" | "admin";
export type VehicleType = "bike" | "car" | "suv" | "ev";
export type SlotType = "regular" | "compact" | "ev" | "disabled";
export type SlotStatus = "available" | "occupied" | "reserved" | "maintenance";
export type ReservationStatus = "confirmed" | "cancelled" | "completed" | "expired";
export type SessionStatus = "active" | "completed";
export type PaymentMethod = "cash" | "card" | "upi" | "wallet";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  password_hash: string;
  role: UserRole;
  created_at: Date;
}
export type PublicUser = Omit<User, "password_hash">;

export interface Vehicle {
  id: number;
  user_id: number;
  plate_number: string;
  type: VehicleType;
  make: string | null;
  model: string | null;
  created_at: Date;
}

export interface ParkingLot {
  id: number;
  name: string;
  address: string;
  city: string;
  hourly_rate: string;
  is_active: boolean;
  created_at: Date;
}
export interface LotWithAvailability extends ParkingLot {
  total_slots: number;
  available_slots: number;
  occupied_slots: number;
}

export interface ParkingSlot {
  id: number;
  lot_id: number;
  slot_number: string;
  slot_type: SlotType;
  status: SlotStatus;
}

export interface Reservation {
  id: number;
  user_id: number;
  vehicle_id: number;
  slot_id: number;
  start_time: Date;
  end_time: Date;
  status: ReservationStatus;
  created_at: Date;
}
export interface ReservationDetails extends Reservation {
  slot_number: string;
  lot_name: string;
  plate_number: string;
}

export interface ParkingSession {
  id: number;
  vehicle_id: number;
  slot_id: number;
  entry_time: Date;
  exit_time: Date | null;
  amount: string | null;
  status: SessionStatus;
}
export interface SessionDetails extends ParkingSession {
  plate_number: string;
  slot_number: string;
  lot_name: string;
}

export interface Payment {
  id: number;
  session_id: number;
  amount: string;
  method: PaymentMethod | null;
  status: PaymentStatus;
  paid_at: Date | null;
  created_at: Date;
}
export interface PendingPayment extends Payment {
  plate_number: string;
}
export interface DailyRevenue {
  day: Date;
  revenue: string;
  payments: number;
}
