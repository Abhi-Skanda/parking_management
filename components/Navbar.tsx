"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "./AuthProvider";
import { Button } from "./ui/Button";
import type { UserRole } from "@/lib/client/types";

const links: { href: string; label: string; roles: UserRole[] }[] = [
  { href: "/", label: "Dashboard", roles: ["driver", "attendant", "admin"] },
  { href: "/lots", label: "Find parking", roles: ["driver", "attendant", "admin"] },
  { href: "/vehicles", label: "Vehicles", roles: ["driver"] },
  { href: "/reservations", label: "Reservations", roles: ["driver"] },
  { href: "/sessions", label: "My parking", roles: ["driver"] },
  { href: "/payments", label: "Payments", roles: ["driver"] },
  { href: "/staff", label: "Gate", roles: ["attendant", "admin"] },
  { href: "/admin", label: "Admin", roles: ["admin"] },
];

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const visible = user ? links.filter((l) => l.roles.includes(user.role)) : [];

  async function onLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">P</span>
          ParkEasy
        </Link>
        <Suspense fallback="null">
        <nav className="hidden items-center gap-1 md:flex">
          {visible.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                pathname === l.href ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        </Suspense>

        <div className="hidden items-center gap-3 md:flex">
          {!loading && user && (
            <>
              <span className="text-sm text-slate-600">
                {user.name} <span className="text-xs capitalize text-slate-400">({user.role})</span>
              </span>
              <Button variant="secondary" size="sm" onClick={onLogout}>
                Log out
              </Button>
            </>
          )}
          {!loading && !user && (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Log in
              </Link>
              <Link href="/register" className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          ☰
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 px-4 py-3 md:hidden">
          {visible.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                pathname === l.href ? "bg-indigo-50 text-indigo-700" : "text-slate-600"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <button onClick={onLogout} className="mt-2 block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-600">
              Log out ({user.name})
            </button>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-600">Log in</Link>
              <Link href="/register" onClick={() => setOpen(false)} className="block px-3 py-2 text-sm font-medium text-indigo-600">Sign up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
