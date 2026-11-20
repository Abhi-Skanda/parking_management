import { route, ok, parseBody, parseId, parseQuery, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { createSlotSchema, slotsQuerySchema } from "@/lib/validators";
import { getLotById } from "@/db/queries/lots";
import { createSlot, getAvailableSlots, getSlotsByLot } from "@/db/queries/slots";

// GET /api/lots/1/slots?available=true&type=ev
export const GET = route<{ id: string }>(async (req, { id }) => {
  await requireUser();
  const lotId = parseId(id);
  const { available, type } = parseQuery(req, slotsQuerySchema);

  if (!(await getLotById(lotId))) throw new ApiError(404, "Lot not found");

  const slots = available === "true" ? await getAvailableSlots(lotId, type) : await getSlotsByLot(lotId);
  return ok(type && available !== "true" ? slots.filter((s) => s.slot_type === type) : slots);
});

export const POST = route<{ id: string }>(async (req, { id }) => {
  await requireUser(["admin"]);
  const lotId = parseId(id);
  if (!(await getLotById(lotId))) throw new ApiError(404, "Lot not found");

  const slot = await createSlot({ lotId, ...(await parseBody(req, createSlotSchema)) });
  return ok(slot, 201);
});
