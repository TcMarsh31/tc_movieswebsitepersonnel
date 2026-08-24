import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "family_movies_admin";

function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.includes("PASTE_YOUR")) {
    throw new Error("Set ADMIN_PASSWORD in .env.local");
  }
  return password;
}

function sessionToken(password: string) {
  return createHmac("sha256", password)
    .update("family-movies-admin-v1")
    .digest("hex");
}

export async function isAdminLoggedIn() {
  try {
    const password = getAdminPassword();
    const expected = sessionToken(password);
    const jar = await cookies();
    const token = jar.get(COOKIE_NAME)?.value;
    if (!token) return false;
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function loginAdmin(password: string) {
  const expected = getAdminPassword();
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return false;
  }

  const jar = await cookies();
  jar.set(COOKIE_NAME, sessionToken(expected), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return true;
}

export async function logoutAdmin() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
