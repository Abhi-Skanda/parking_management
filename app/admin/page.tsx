"use client";

import { useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { LotsPanel } from "@/components/admin/LotsPanel";
import { RevenuePanel } from "@/components/admin/RevenuePanel";
import { UsersPanel } from "@/components/admin/UsersPanel";
import { PageHeader } from "@/components/ui/Card";

const tabs = [
  { id: "revenue", label: "Revenue" },
  { id: "lots", label: "Lots & slots" },
  { id: "users", label: "Users" },
] as const;

export default function AdminPage() {
  return (
    <RequireAuth roles={["admin"]}>
      <Admin />
    </RequireAuth>
  );
}

function Admin() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("revenue");
  return (
    <>
      <PageHeader title="Admin" subtitle="Revenue, lots and staff accounts." />
      <div className="mb-6 flex gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
              tab === t.id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "revenue" && <RevenuePanel />}
      {tab === "lots" && <LotsPanel />}
      {tab === "users" && <UsersPanel />}
    </>
  );
}
