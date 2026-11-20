"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Alert } from "@/components/ui/Feedback";
import { errorMessage } from "@/lib/client/http";
import { homeFor } from "@/lib/client/format";

export default function RegisterPage() {
  const { user, register } = useAuth();
  const router = useRouter();
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    if (user) router.replace(homeFor(user.role));
  }, [user, router]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register({ ...f, phone: f.phone || undefined });
      router.replace("/");
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <Card className="mx-auto mt-10 max-w-md">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <p className="mb-6 mt-1 text-sm text-slate-500">Reserve and pay for parking in seconds.</p>
      <form onSubmit={submit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <Input label="Full name" required autoComplete="name" value={f.name} onChange={set("name")} />
        <Input label="Email" type="email" required autoComplete="email" value={f.email} onChange={set("email")} />
        <Input label="Phone (optional)" type="tel" autoComplete="tel" value={f.phone} onChange={set("phone")} />
        <Input label="Password (min 8 characters)" type="password" required minLength={8} autoComplete="new-password" value={f.password} onChange={set("password")} />
        <Button type="submit" className="w-full" loading={busy}>Sign up</Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already registered? <Link href="/login" className="font-medium text-indigo-600 hover:underline">Log in</Link>
      </p>
    </Card>
  );
}
