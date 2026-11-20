"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Field";
import { Alert, QueryBoundary } from "@/components/ui/Feedback";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { useQuery } from "@/hooks/useQuery";
import { api, errorMessage } from "@/lib/client/http";
import { dateTime } from "@/lib/client/format";
import type { UserDTO } from "@/lib/client/types";

export function UsersPanel() {
  const toast = useToast();
  const users = useQuery<UserDTO[]>("/admin/users");
  const [f, setF] = useState({ name: "", email: "", password: "", role: "attendant" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/admin/users", { method: "POST", body: f });
      toast(`${f.role} account created`);
      setF({ name: "", email: "", password: "", role: "attendant" });
      users.reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="mb-4 font-semibold">Create staff account</h3>
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          {error && <div className="sm:col-span-2"><Alert>{error}</Alert></div>}
          <Input label="Name" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <Input label="Email" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          <Input label="Password (min 8)" type="password" required minLength={8} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
          <Select label="Role" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>
            <option value="attendant">Attendant</option>
            <option value="admin">Admin</option>
          </Select>
          <div className="sm:col-span-2">
            <Button type="submit" loading={busy}>Create account</Button>
          </div>
        </form>
      </Card>

      <QueryBoundary query={users}>
        {(data) => (
          <Card className="overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge tone={u.role === "admin" ? "indigo" : u.role === "attendant" ? "amber" : "slate"}>{u.role}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{dateTime(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </QueryBoundary>
    </div>
  );
}
