import { route, ok, parseBody } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { vehicleSchema } from "@/lib/validators";
import { addVehicle, getVehiclesByUser } from "@/db/queries/vehicles";

export const GET = route(async () => {
  const user = await requireUser();
  return ok(await getVehiclesByUser(user.id));
});

export const POST = route(async (req) => {
  const user = await requireUser();
  const body = await parseBody(req, vehicleSchema);
  const vehicle = await addVehicle({ userId: user.id, ...body });
  return ok(vehicle, 201);
});
