import crypto from "node:crypto";

const SESSION_COOKIE_NAME = "mono_cart_session";

export function getSessionId(request: Request): { sessionId: string; headers?: Headers } {
  const cookieHeader = request.headers.get("Cookie");
  let sessionId: string | null = null;

  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [key, ...v] = c.trim().split("=");
        return [key, decodeURIComponent(v.join("="))];
      })
    );
    sessionId = cookies[SESSION_COOKIE_NAME] || null;
  }

  if (sessionId) {
    return { sessionId };
  }

  // Create new session ID
  const newSessionId = `sess_${crypto.randomUUID()}`;
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=${newSessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`
  );

  return { sessionId: newSessionId, headers };
}

