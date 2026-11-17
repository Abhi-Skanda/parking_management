import { query } from "../pool";
import type { DailyRevenue, Payment, PaymentMethod, PendingPayment } from "../types";

export async function getPaymentBySession(sessionId: number): Promise<Payment | null> {
  const { rows } = await query<Payment>(`SELECT * FROM payments WHERE session_id = $1`, [sessionId]);
  return rows[0] ?? null;
}

export async function markPaymentPaid(paymentId: number, method: PaymentMethod): Promise<Payment | null> {
  const { rows } = await query<Payment>(
    `UPDATE payments SET status = 'paid', method = $2, paid_at = NOW()
     WHERE id = $1 AND status = 'pending' RETURNING *`,
    [paymentId, method]
  );
  return rows[0] ?? null;
}

export async function getPendingPaymentsByUser(userId: number): Promise<PendingPayment[]> {
  const { rows } = await query<PendingPayment>(
    `SELECT p.*, v.plate_number
     FROM payments p
     JOIN parking_sessions ps ON ps.id = p.session_id
     JOIN vehicles v          ON v.id = ps.vehicle_id
     WHERE v.user_id = $1 AND p.status = 'pending'
     ORDER BY p.created_at DESC`,
    [userId]
  );
  return rows;
}

// Admin: revenue per day for the last N days
export async function getRevenueByDay(days = 30): Promise<DailyRevenue[]> {
  const { rows } = await query<DailyRevenue>(
    `SELECT DATE(paid_at) AS day, SUM(amount)::numeric(12,2) AS revenue, COUNT(*)::int AS payments
     FROM payments
     WHERE status = 'paid' AND paid_at >= NOW() - ($1 || ' days')::interval
     GROUP BY DATE(paid_at)
     ORDER BY day DESC`,
    [String(days)]
  );
  return rows;
}
