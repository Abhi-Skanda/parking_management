import { route, ok, parseBody } from "@/lib/api";
import { hashPassword, requireUser } from "@/lib/auth";
import { createStaffSchema } from "@/lib/validators";
import { createUser, listUsers } from "@/db/queries/users";

export const GET = route(async () => {
  await requireUser(["admin"]);
  return ok(await listUsers());
});

// Create an attendant or another admin
export const POST = route(async (req) => {
  await requireUser(["admin"]);
  const body = await parseBody(req, createStaffSchema);
  const user = await createUser({
    name: body.name,
    email: body.email,
    phone: body.phone,
    passwordHash: await hashPassword(body.password),
    role: body.role,
  });
  return ok(user, 201);
});
