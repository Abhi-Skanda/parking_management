import { route, ok, parseBody, parseQuery, ApiError } from "@/lib/api";
import { isStaff, requireUser } from "@/lib/auth";
import { checkInSchema, sessionsQuerySchema } from "@/lib/validators";
import { checkIn, getActiveSessions, getSessionHistoryByUser } from "@/db/queries/sessions";
import { getVehicleByPlate, getVehiclesByUser } from "@/db/queries/vehicles";

// GET /api/sessions            -> my parking history
// GET /api/sessions?scope=active -> everything currently parked (staff only)
export const GET = route(async (req) => {
  const user = await requireUser();
  const { scope } = parseQuery(req, sessionsQuerySchema);

  if (scope === "active") {
    if (!isStaff(user)) throw new ApiError(403, "You don't have permission to do this");
    return ok(await getActiveSessions());
  }
  return ok(await getSessionHistoryByUser(user.id));
});

// Check-in. Drivers: own vehicle (vehicleId or plateNumber). Staff: plateNumber of any vehicle.
export const POST = route(async (req) => {
  const user = await requireUser();
  const body = await parseBody(req, checkInSchema);

  const vehicle = body.plateNumber
    ? await getVehicleByPlate(body.plateNumber)
    : (await getVehiclesByUser(user.id)).find((v) => v.id === body.vehicleId) ?? null;

  if (!vehicle) throw new ApiError(404, "Vehicle not found");
  if (!isStaff(user) && vehicle.user_id !== user.id) throw new ApiError(403, "That vehicle isn't yours");

  const session = await checkIn({ vehicleId: vehicle.id, slotId: body.slotId });
  return ok(session, 201);
});
