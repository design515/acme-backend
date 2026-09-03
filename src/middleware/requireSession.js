import { validateSession } from "../services/sessionService.js";

export function requireSession(req, res, next) {
  const header = req.headers.authorization ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();

  const result = validateSession(token);
  if (!result.valid) {
    return res.status(401).json({ error: result.error });
  }

  req.session = result.session;
  return next();
}
