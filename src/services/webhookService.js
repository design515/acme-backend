const deliveredEventIds = new Set();

/**
 * Deliver a webhook event once. Duplicate eventIds are rejected.
 */
export function deliverWebhook({ eventId, type, payload } = {}) {
  if (!eventId || typeof eventId !== "string") {
    throw new Error("eventId is required");
  }

  if (deliveredEventIds.has(eventId)) {
    return {
      delivered: false,
      duplicate: true,
      eventId,
      message: "Webhook event already delivered",
    };
  }

  deliveredEventIds.add(eventId);

  return {
    delivered: true,
    duplicate: false,
    eventId,
    type: type ?? "unknown",
    payload: payload ?? {},
    deliveredAt: new Date().toISOString(),
  };
}

export function hasDelivered(eventId) {
  return deliveredEventIds.has(eventId);
}

/** Test helper — clears the in-memory delivery log. */
export function resetDeliveredEvents() {
  deliveredEventIds.clear();
}
