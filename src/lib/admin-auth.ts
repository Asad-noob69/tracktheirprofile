import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const ADMIN_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "tracktheirprofile-default-secret-change-me"
);

const COOKIE_NAME = "ttp_admin";

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, ADMIN_SECRET);
    return payload.admin === true;
  } catch {
    return false;
  }
}
