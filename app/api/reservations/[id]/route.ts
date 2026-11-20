import { route, ok, parseId, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { cancelReservation } from "@/db/queries/reservations";

export const DELETE = route<{ id: string }>(async (_req, { id }) => {
  const user = await requireUser();
  const cancelled = await cancelReservation(parseId(id), user.id);
  if (!cancelled) throw new ApiError(404, "Active reservation not found");
  return ok(cancelled);
});
