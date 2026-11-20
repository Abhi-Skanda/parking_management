import { route, ok, parseBody } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { createLotSchema } from "@/lib/validators";
import { createLot, listLotsWithAvailability } from "@/db/queries/lots";

// GET /api/lots                       -> active lots
// GET /api/lots?includeInactive=true  -> all lots (admin only; ignored for other roles)
export const GET = route(async (req) => {
  const user = await requireUser();
  const includeInactive =
    user.role === "admin" && req.nextUrl.searchParams.get("includeInactive") === "true";
  return ok(await listLotsWithAvailability(includeInactive));
});

export const POST = route(async (req) => {
  await requireUser(["admin"]);
  const lot = await createLot(await parseBody(req, createLotSchema));
  return ok(lot, 201);
});
