/**
 * Parse an order-related date string.
 * Rejects empty values and values that do not resolve to a real date.
 */
export function parseOrderDate(value, fieldName = "date") {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Invalid ${fieldName} format`);
  }

  const trimmed = value.trim();
  const parsed = new Date(trimmed);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid ${fieldName} format`);
  }

  // Reject clearly malformed inputs that Date may still coerce oddly,
  // e.g. bare numbers without a date separator when an ISO-like value is expected.
  if (/^\d+$/.test(trimmed)) {
    throw new Error(`Invalid ${fieldName} format`);
  }

  return parsed;
}

export function toOrderDateIso(value, fieldName = "date") {
  return parseOrderDate(value, fieldName).toISOString();
}
