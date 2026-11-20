import { route, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { getPendingPaymentsByUser } from "@/db/queries/payments";

export const GET = route(async () => {
  const user = await requireUser();
  return ok(await getPendingPaymentsByUser(user.id));
});
