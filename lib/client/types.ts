// Client-side shapes = the DB row types, with Date turned into string (that's what JSON gives us).
// `import type` is erased at build time, so no server code ends up in the browser bundle.
import type {
  DailyRevenue,
  LotWithAvailability,
  ParkingLot,
  ParkingSession,
  ParkingSlot,
  Payment,
  PendingPayment,
  PublicUser,
  ReservationDetails,
  SessionDetails,
  Vehicle,
} from "@/db/types";

export type {
  PaymentMethod,
  SlotStatus,
  SlotType,
  UserRole,
  VehicleType,
} from "@/db/types";

export type Serialized<T> = T extends Date
  ? string
  : T extends object
    ? { [K in keyof T]: Serialized<T[K]> }
    : T;

export type UserDTO = Serialized<PublicUser>;
export type VehicleDTO = Serialized<Vehicle>;
export type LotDTO = Serialized<LotWithAvailability>;
export type ParkingLotDTO = Serialized<ParkingLot>;
export type SlotDTO = Serialized<ParkingSlot>;
export type ReservationDTO = Serialized<ReservationDetails>;
export type SessionDTO = Serialized<ParkingSession>;
export type SessionDetailsDTO = Serialized<SessionDetails>;
export type PaymentDTO = Serialized<Payment>;
export type PendingPaymentDTO = Serialized<PendingPayment>;
export type DailyRevenueDTO = Serialized<DailyRevenue>;
