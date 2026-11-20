import { route, ok, parseBody } from "@/lib/api";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { createUser } from "@/db/queries/users";

// Public sign-up always creates a 'driver'. Staff/admin accounts are created by an admin.
export const POST = route(async (req) => {
  const body = await parseBody(req, registerSchema);
  const user = await createUser({
    name: body.name,
    email: body.email,
    phone: body.phone,
    passwordHash: await hashPassword(body.password),
  });
  await setAuthCookie(await signToken({ id: user.id, role: user.role }));
  return ok(user, 201);
});
