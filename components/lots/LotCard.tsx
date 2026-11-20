import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { money } from "@/lib/client/format";
import type { LotDTO } from "@/lib/client/types";

export function LotCard({ lot }: { lot: LotDTO }) {
  const pct = lot.total_slots ? Math.round((lot.available_slots / lot.total_slots) * 100) : 0;
  const tone = pct === 0 ? "bg-rose-500" : pct < 25 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-900">{lot.name}</h3>
          <p className="text-sm text-slate-500">
            {lot.address}, {lot.city}
          </p>
        </div>
        {!lot.is_active && <Badge tone="slate">inactive</Badge>}
      </div>

      <p className="mt-3 text-sm text-slate-600">
        <span className="text-lg font-semibold text-slate-900">{money(lot.hourly_rate)}</span> / hour
      </p>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>{lot.available_slots} free</span>
          <span>{lot.total_slots} total</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full ${tone}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <Link
        href={`/lots/${lot.id}`}
        className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-indigo-700"
      >
        View slots
      </Link>
    </Card>
  );
}
