// Browser-side fetch wrapper for our own /api routes.
export class ApiClientError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiClientError";
  }
}

interface Options {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
}

export async function api<T>(path: string, { method = "GET", body }: Options = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const details: string = Array.isArray(json?.details)
      ? json.details
          .map((d: { path?: string; message: string }) => (d.path ? `${d.path}: ${d.message}` : d.message))
          .join(", ")
      : "";
    const base: string = json?.error ?? `Request failed (${res.status})`;
    throw new ApiClientError(res.status, details ? `${base} (${details})` : base);
  }
  return json.data as T;
}

export const errorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : "Something went wrong";
