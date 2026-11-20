import { route, ok, parseBody, parseId, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { slotStatusSchema } from "@/lib/validators";
import { updateSlotStatus } from "@/db/queries/slots";

export const PATCH = route<{ id: string }>(async (req, { id }) => {
  await requireUser(["admin", "attendant"]);
  const { status } = await parseBody(req, slotStatusSchema);
  const slot = await updateSlotStatus(parseId(id), status);
  if (!slot) throw new ApiError(404, "Slot not found");
  return ok(slot);
});
