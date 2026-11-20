import type { SlotDTO, SlotStatus, SlotType } from "@/lib/client/types";

const styles: Record<SlotStatus, string> = {
  available: "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
  occupied: "border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100",
  reserved: "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100",
  maintenance: "border-slate-300 bg-slate-100 text-slate-500 hover:bg-slate-200",
};

const typeLabel: Record<SlotType, string> = {
  regular: "Regular",
  compact: "Compact",
  ev: "EV ⚡",
  disabled: "Accessible",
};

export function SlotLegend() {
  const items: [SlotStatus, string][] = [
    ["available", "Available"],
    ["occupied", "Occupied"],
    ["reserved", "Reserved"],
    ["maintenance", "Maintenance"],
  ];
  return (
    <div className="flex flex-wrap gap-3 text-xs text-slate-600">
      {items.map(([s, label]) => (
        <span key={s} className="flex items-center gap-1.5">
          <span className={`h-3 w-3 rounded border ${styles[s].split(" ").slice(0, 2).join(" ")}`} />
          {label}
        </span>
      ))}
    </div>
  );
}

export function SlotGrid({
  slots,
  selectedId,
  onSelect,
}: {
  slots: SlotDTO[];
  selectedId: number | null;
  onSelect: (slot: SlotDTO) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {slots.map((s) => (
        <button
          key={s.id}
          onClick={() => onSelect(s)}
          aria-pressed={selectedId === s.id}
          className={`rounded-lg border p-3 text-left transition-colors ${styles[s.status]} ${
            selectedId === s.id ? "ring-2 ring-indigo-500 ring-offset-1" : ""
          }`}
        >
          <div className="text-base font-semibold">{s.slot_number}</div>
          <div className="text-xs">{typeLabel[s.slot_type]}</div>
          <div className="mt-1 text-xs capitalize opacity-80">{s.status}</div>
        </button>
      ))}
    </div>
  );
}
