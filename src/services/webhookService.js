const deliveries = new Map();

export function defaultTransport(_event) {
  // Successful no-op outbound delivery for local/in-memory use.
}

/**
 * Atomically claim an event for delivery.
 * - delivered / in_flight → duplicate (not retryable)
 * - failed / missing → claim as in_flight (retry allowed after failure)
 */
function claimDelivery(eventId, type, payload) {
  const existing = deliveries.get(eventId);

  if (existing?.status === "delivered") {
    return {
      claimed: false,
      result: {
        delivered: false,
        duplicate: true,
        retryable: false,
        eventId,
        message: "Webhook event already delivered",
      },
    };
  }

  if (existing?.status === "in_flight") {
    return {
      claimed: false,
      result: {
        delivered: false,
        duplicate: true,
        retryable: false,
        eventId,
        message: "Webhook delivery already in progress",
      },
    };
  }

  const attempts = (existing?.attempts ?? 0) + 1;
  const record = {
    status: "in_flight",
    eventId,
    type,
    payload,
    attempts,
  };
  deliveries.set(eventId, record);

  return { claimed: true, record };
}

/**
 * Deliver a webhook at most once on success.
 * Failed deliveries are marked failed and may be retried.
 */
export async function deliverWebhook(
  { eventId, type, payload } = {},
  { transport = defaultTransport } = {},
) {
  if (!eventId || typeof eventId !== "string") {
    throw new Error("eventId is required");
  }

  const normalizedType = type ?? "unknown";
  const normalizedPayload = payload ?? {};
  const claim = claimDelivery(eventId, normalizedType, normalizedPayload);

  if (!claim.claimed) {
    return claim.result;
  }

  const { record } = claim;

  try {
    await transport({
      eventId,
      type: normalizedType,
      payload: normalizedPayload,
    });

    const deliveredAt = new Date().toISOString();
    deliveries.set(eventId, {
      ...record,
      status: "delivered",
      deliveredAt,
      lastError: undefined,
    });

    return {
      delivered: true,
      duplicate: false,
      retryable: false,
      eventId,
      type: normalizedType,
      payload: normalizedPayload,
      attempts: record.attempts,
      deliveredAt,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    deliveries.set(eventId, {
      ...record,
      status: "failed",
      lastError: message,
    });

    return {
      delivered: false,
      duplicate: false,
      retryable: true,
      eventId,
      attempts: record.attempts,
      error: message,
      message: "Webhook delivery failed",
    };
  }
}

export function hasDelivered(eventId) {
  return deliveries.get(eventId)?.status === "delivered";
}

export function getDeliveryRecord(eventId) {
  return deliveries.get(eventId) ?? null;
}

/** Test helper — clears the in-memory delivery log. */
export function resetDeliveredEvents() {
  deliveries.clear();
}
