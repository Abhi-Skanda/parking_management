import { route, ok, parseBody, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { reservationSchema } from "@/lib/validators";
import { createReservation, getReservationsByUser } from "@/db/queries/reservations";
import { getVehiclesByUser } from "@/db/queries/vehicles";

export const GET = route(async () => {
  const user = await requireUser();
  return ok(await getReservationsByUser(user.id));
});

export const POST = route(async (req) => {
  const user = await requireUser();
  const body = await parseBody(req, reservationSchema);

  // The vehicle must belong to the caller
  const vehicles = await getVehiclesByUser(user.id);
  if (!vehicles.some((v) => v.id === body.vehicleId)) throw new ApiError(404, "Vehicle not found");

  const reservation = await createReservation({
    userId: user.id,
    vehicleId: body.vehicleId,
    slotId: body.slotId,
    startTime: body.startTime,
    endTime: body.endTime,
  });
  return ok(reservation, 201);
});
