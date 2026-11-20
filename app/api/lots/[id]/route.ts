import { route, ok, parseBody, parseId, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { patchLotSchema } from "@/lib/validators";
import { getLotById, setLotActive, updateLotRate } from "@/db/queries/lots";

export const GET = route<{ id: string }>(async (_req, { id }) => {
  await requireUser();
  const lot = await getLotById(parseId(id));
  if (!lot) throw new ApiError(404, "Lot not found");
  return ok(lot);
});

export const PATCH = route<{ id: string }>(async (req, { id }) => {
  await requireUser(["admin"]);
  const lotId = parseId(id);
  const body = await parseBody(req, patchLotSchema);

  let lot = await getLotById(lotId);
  if (!lot) throw new ApiError(404, "Lot not found");

  if (body.hourlyRate !== undefined) lot = (await updateLotRate(lotId, body.hourlyRate)) ?? lot;
  if (body.isActive !== undefined) lot = (await setLotActive(lotId, body.isActive)) ?? lot;
  return ok(lot);
});
