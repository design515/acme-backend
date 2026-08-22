const sessions = new Map();

export function registerSession(token, expiresAt) {
  sessions.set(token, { token, expiresAt });
}

export function validateSession(token, now = Date.now()) {
  if (!token) {
    return { valid: false, error: "Unauthorized" };
  }

  const session = sessions.get(token);
  if (!session) {
    return { valid: false, error: "Unauthorized" };
  }

  if (session.expiresAt <= now) {
    return { valid: false, error: "Session expired" };
  }

  return { valid: true, session };
}

/** Test helper — clears in-memory sessions. */
export function resetSessions() {
  sessions.clear();
}
