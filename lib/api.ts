import { NextResponse, type NextRequest } from "next/server";
import { ZodError, type ZodType, type z } from "zod";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export const ok = <T>(data: T, status = 200) => NextResponse.json({ data }, { status });
const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

export async function parseBody<S extends ZodType>(req: NextRequest, schema: S): Promise<z.infer<S>> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new ApiError(400, "Request body must be valid JSON");
  }
  return schema.parse(json) as z.infer<S>;
}

export function parseQuery<S extends ZodType>(req: NextRequest, schema: S): z.infer<S> {
  return schema.parse(Object.fromEntries(req.nextUrl.searchParams)) as z.infer<S>;
}

export function parseId(value: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) throw new ApiError(400, "Invalid id");
  return n;
}

export function handleError(err: unknown): NextResponse {
  if (err instanceof ApiError) return fail(err.status, err.message);

  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      },
      { status: 400 }
    );
  }

  // Postgres error codes
  const code = (err as { code?: string } | null)?.code;
  if (code === "23505") return fail(409, "Resource already exists or is already in use");
  if (code === "23503") return fail(409, "Referenced record is missing or still in use");
  if (code === "23514") return fail(400, "Value violates a database rule");

  // Business-rule errors thrown by db/queries (plain Errors)
  if (err instanceof Error) {
    if (/not found/i.test(err.message)) return fail(404, err.message);
    if (/occupied|already|maintenance/i.test(err.message)) return fail(409, err.message);
  }

  console.error(err);
  return fail(500, "Internal server error");
}

/**
 * Wraps a handler: awaits Next's async params, and converts any thrown error into a JSON response.
 * Usage: export const GET = route<{ id: string }>(async (req, { id }) => ok(...));
 */
export function route<P extends Record<string, string> = Record<string, never>>(
  handler: (req: NextRequest, params: P) => Promise<Response>
) {
  return async (req: NextRequest, ctx: { params: Promise<P> }): Promise<Response> => {
    try {
      return await handler(req, await ctx.params);
    } catch (err) {
      return handleError(err);
    }
  };
}
