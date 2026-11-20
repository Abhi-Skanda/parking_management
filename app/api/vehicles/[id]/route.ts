import { route, ok, parseId, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { deleteVehicle } from "@/db/queries/vehicles";

export const DELETE = route<{ id: string }>(async (_req, { id }) => {
  const user = await requireUser();
  const deleted = await deleteVehicle(parseId(id), user.id); // scoped to the owner
  if (!deleted) throw new ApiError(404, "Vehicle not found");
  return ok({ deleted: true });
});
