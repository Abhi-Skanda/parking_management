import { route, ok, ApiError } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { getUserById } from "@/db/queries/users";

export const GET = route(async () => {
  const session = await requireUser();
  const user = await getUserById(session.id);
  if (!user) throw new ApiError(401, "Account no longer exists");
  return ok(user);
});
