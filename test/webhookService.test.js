import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  deliverWebhook,
  hasDelivered,
  resetDeliveredEvents,
} from "../src/services/webhookService.js";

describe("deliverWebhook", () => {
  beforeEach(() => {
    resetDeliveredEvents();
  });

  it("delivers a new webhook event", () => {
    const result = deliverWebhook({
      eventId: "evt_001",
      type: "order.created",
      payload: { orderId: "ord_1" },
    });

    assert.equal(result.delivered, true);
    assert.equal(result.duplicate, false);
    assert.equal(result.eventId, "evt_001");
    assert.equal(hasDelivered("evt_001"), true);
  });

  it("rejects duplicate webhook delivery for the same eventId", () => {
    deliverWebhook({
      eventId: "evt_dup",
      type: "payment.succeeded",
      payload: { amount: 10 },
    });

    const duplicate = deliverWebhook({
      eventId: "evt_dup",
      type: "payment.succeeded",
      payload: { amount: 10 },
    });

    assert.equal(duplicate.delivered, false);
    assert.equal(duplicate.duplicate, true);
    assert.equal(duplicate.eventId, "evt_dup");
    assert.match(duplicate.message, /already delivered/i);
  });

  it("allows different eventIds to be delivered independently", () => {
    const first = deliverWebhook({ eventId: "evt_a", type: "a" });
    const second = deliverWebhook({ eventId: "evt_b", type: "b" });

    assert.equal(first.delivered, true);
    assert.equal(second.delivered, true);
  });

  it("requires an eventId", () => {
    assert.throws(() => deliverWebhook({ type: "order.created" }), {
      message: /eventId is required/,
    });
  });
});
