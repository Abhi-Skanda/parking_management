"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import { EmptyState, QueryBoundary } from "@/components/ui/Feedback";
import { StatCard } from "@/components/ui/StatCard";
import { useQuery } from "@/hooks/useQuery";
import { dateOnly, money } from "@/lib/client/format";
import type { DailyRevenueDTO } from "@/lib/client/types";

export function RevenuePanel() {
  const [days, setDays] = useState("30");
  const query = useQuery<DailyRevenueDTO[]>(`/admin/revenue?days=${days}`);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select label="Period" value={days} onChange={(e) => setDays(e.target.value)}>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </Select>
      </div>

      <QueryBoundary query={query}>
        {(rows) => {
          const total = rows.reduce((s, r) => s + Number(r.revenue), 0);
          const count = rows.reduce((s, r) => s + r.payments, 0);
          const max = Math.max(1, ...rows.map((r) => Number(r.revenue)));
          const chronological = [...rows].reverse();

          return (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Revenue" value={money(total)} hint={`last ${days} days`} />
                <StatCard label="Paid sessions" value={count} />
                <StatCard label="Avg per payment" value={money(count ? total / count : 0)} />
              </div>
              {rows.length === 0 ? (
                <EmptyState title="No paid sessions in this period" />
              ) : (
                <Card>
                  <h3 className="mb-4 font-semibold">Revenue by day</h3>
                  <ul className="space-y-2">
                    {chronological.map((r) => (
                      <li key={r.day} className="flex items-center gap-3 text-sm">
                        <span className="w-16 shrink-0 text-slate-500">{dateOnly(r.day)}</span>
                        <div className="h-5 flex-1 overflow-hidden rounded bg-slate-100">
                          <div className="h-full rounded bg-indigo-500" style={{ width: `${(Number(r.revenue) / max) * 100}%` }} />
                        </div>
                        <span className="w-24 shrink-0 text-right font-medium">{money(r.revenue)}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </>
          );
        }}
      </QueryBoundary>
    </div>
  );
}
