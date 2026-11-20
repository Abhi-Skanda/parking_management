import type { ReactNode } from "react";
import type { QueryResult } from "@/hooks/useQuery";

export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-indigo-600 border-t-transparent ${className}`}
    />
  );
}

export function PageSpinner() {
  return (
    <div className="flex justify-center py-20" role="status" aria-label="Loading">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

export function Alert({ tone = "error", children }: { tone?: "error" | "info"; children: ReactNode }) {
  const cls =
    tone === "error"
      ? "border-rose-200 bg-rose-50 text-rose-800"
      : "border-indigo-200 bg-indigo-50 text-indigo-800";
  return (
    <div role="alert" className={`rounded-lg border px-4 py-3 text-sm ${cls}`}>
      {children}
    </div>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <p className="font-medium text-slate-700">{title}</p>
      {hint && <p className="mt-1 text-sm text-slate-500">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Shows a spinner / error until the query has data, then renders children(data). */
export function QueryBoundary<T>({
  query,
  children,
}: {
  query: QueryResult<T>;
  children: (data: T) => ReactNode;
}) {
  if (query.error && !query.data) return <Alert>{query.error}</Alert>;
  if (!query.data) return <PageSpinner />;
  return <>{children(query.data)}</>;
}
