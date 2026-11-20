import { route, ok, parseBody, parseId, ApiError } from "@/lib/api";
import { isStaff, requireUser } from "@/lib/auth";
import { paySchema } from "@/lib/validators";
import { getPendingPaymentsByUser, markPaymentPaid } from "@/db/queries/payments";

// NOTE: this records a payment; it does not talk to a payment gateway.
// Plug Razorpay/Stripe in here and call markPaymentPaid from the verified webhook instead.
export const POST = route<{ id: string }>(async (req, { id }) => {
  const user = await requireUser();
  const paymentId = parseId(id);
  const { method } = await parseBody(req, paySchema);

  if (!isStaff(user)) {
    const mine = await getPendingPaymentsByUser(user.id);
    if (!mine.some((p) => p.id === paymentId)) throw new ApiError(404, "Pending payment not found");
  }

  const payment = await markPaymentPaid(paymentId, method);
  if (!payment) throw new ApiError(404, "Pending payment not found");
  return ok(payment);
});
