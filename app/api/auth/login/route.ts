import { route, ok, parseBody, ApiError } from "@/lib/api";
import { DUMMY_HASH, setAuthCookie, signToken, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { getUserByEmail } from "@/db/queries/users";

export const POST = route(async (req) => {
  const { email, password } = await parseBody(req, loginSchema);
  const user = await getUserByEmail(email);

  // Always run one bcrypt compare, and use one message, so neither timing nor wording reveals whether the email exists
  const valid = await verifyPassword(password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !valid) throw new ApiError(401, "Invalid email or password");

  await setAuthCookie(await signToken({ id: user.id, role: user.role }));
  const { password_hash: _omit, ...publicUser } = user;
  return ok(publicUser);
});
