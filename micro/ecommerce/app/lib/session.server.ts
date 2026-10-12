import { createCookie } from "react-router";

export const sessionCookie = createCookie("micro_session", {
  maxAge: 604_800, // one week
  httpOnly: true,
  path: "/",
  sameSite: "lax",
});

export async function getSessionId(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  const sessionId = await sessionCookie.parse(cookieHeader);
  return sessionId || null;
}

