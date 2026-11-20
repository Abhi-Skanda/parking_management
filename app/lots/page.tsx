"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { LotCard } from "@/components/lots/LotCard";
import { PageHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { EmptyState, QueryBoundary } from "@/components/ui/Feedback";
import { useQuery } from "@/hooks/useQuery";
import type { LotDTO } from "@/lib/client/types";

export default function LotsPage() {
  return (
    <RequireAuth>
      <Lots />
    </RequireAuth>
  );
}

function Lots() {
  const lots = useQuery<LotDTO[]>("/lots");
  const [search, setSearch] = useState("");

  return (
    <>
      <PageHeader title="Find parking" subtitle="Live availability across all lots." />
      <Input label="Search by name or city" value={search} onChange={(e) => setSearch(e.target.value)} className="mb-6 max-w-sm" />
      <QueryBoundary query={lots}>
        {(data) => {
          const q = search.trim().toLowerCase();
          const filtered = q ? data.filter((l) => `${l.name} ${l.city} ${l.address}`.toLowerCase().includes(q)) : data;
          return filtered.length === 0 ? (
            <EmptyState title="No lots found" hint={q ? "Try a different search." : "Check back soon."} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((l) => <LotCard key={l.id} lot={l} />)}
            </div>
          );
        }}
      </QueryBoundary>
    </>
  );
}
