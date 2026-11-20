import { route, ok, parseQuery } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { revenueQuerySchema } from "@/lib/validators";
import { getRevenueByDay } from "@/db/queries/payments";

// GET /api/admin/revenue?days=30
export const GET = route(async (req) => {
  await requireUser(["admin"]);
  const { days } = parseQuery(req, revenueQuerySchema);
  return ok(await getRevenueByDay(days));
});
