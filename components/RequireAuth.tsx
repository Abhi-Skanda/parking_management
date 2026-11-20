"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { PageSpinner } from "./ui/Feedback";
import { Card } from "./ui/Card";
import type { UserRole } from "@/lib/client/types";

/**
 * Client-side route guard (UX only). Real protection is enforced by the API routes.
 */
export function RequireAuth({ roles, children }: { roles?: UserRole[]; children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) return <PageSpinner />;

  if (roles && !roles.includes(user.role)) {
    return (
      <Card className="mx-auto mt-10 max-w-md text-center">
        <h2 className="text-lg font-semibold">No access</h2>
        <p className="mt-1 text-sm text-slate-500">Your account doesn&apos;t have permission to view this page.</p>
      </Card>
    );
  }
  return <>{children}</>;
}
