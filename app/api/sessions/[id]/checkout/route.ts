import { route, ok, parseId, ApiError } from "@/lib/api";
import { isStaff, requireUser } from "@/lib/auth";
import { checkOut, getSessionHistoryByUser } from "@/db/queries/sessions";
import { getPaymentBySession } from "@/db/queries/payments";

export const POST = route<{ id: string }>(async (_req, { id }) => {
  const user = await requireUser();
  const sessionId = parseId(id);

  // Drivers can only check out their own active sessions; staff can check out any
  if (!isStaff(user)) {
    const mine = await getSessionHistoryByUser(user.id);
    if (!mine.some((s) => s.id === sessionId && s.status === "active")) {
      throw new ApiError(404, "Active session not found");
    }
  }

  const session = await checkOut(sessionId);
  const payment = await getPaymentBySession(session.id);
  return ok({ session, payment });
});
