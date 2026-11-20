import { route, ok } from "@/lib/api";
import { clearAuthCookie } from "@/lib/auth";

export const POST = route(async () => {
  await clearAuthCookie();
  return ok({ loggedOut: true });
});
