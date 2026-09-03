import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  deliverWebhook,
  getDeliveryRecord,
  hasDelivered,
  resetDeliveredEvents,
} from "../src/services/webhookService.js";

describe("deliverWebhook", () => {
  beforeEach(() => {
    resetDeliveredEvents();
  });

  it("delivers a new webhook event successfully", async () => {
    const result = await deliverWebhook({
      eventId: "evt_001",
      type: "order.created",
      payload: { orderId: "ord_1" },
    });

    assert.equal(result.delivered, true);
    assert.equal(result.duplicate, false);
    assert.equal(result.retryable, false);
    assert.equal(result.eventId, "evt_001");
    assert.equal(result.attempts, 1);
    assert.equal(hasDelivered("evt_001"), true);
  });

  it("rejects duplicate delivery after a successful attempt", async () => {
    await deliverWebhook({
      eventId: "evt_dup",
      type: "payment.succeeded",
      payload: { amount: 10 },
    });

    const duplicate = await deliverWebhook({
      eventId: "evt_dup",
      type: "payment.succeeded",
      payload: { amount: 10 },
    });

    assert.equal(duplicate.delivered, false);
    assert.equal(duplicate.duplicate, true);
    assert.equal(duplicate.retryable, false);
    assert.equal(duplicate.eventId, "evt_dup");
    assert.match(duplicate.message, /already delivered/i);
  });

  it("allows retry after a failed delivery", async () => {
    let shouldFail = true;
    const transport = async () => {
      if (shouldFail) {
        throw new Error("downstream unavailable");
      }
    };

    const failed = await deliverWebhook(
      { eventId: "evt_retry", type: "order.updated" },
      { transport },
    );

    assert.equal(failed.delivered, false);
    assert.equal(failed.duplicate, false);
    assert.equal(failed.retryable, true);
    assert.equal(failed.attempts, 1);
    assert.equal(hasDelivered("evt_retry"), false);
    assert.equal(getDeliveryRecord("evt_retry")?.status, "failed");

    shouldFail = false;
    const retried = await deliverWebhook(
      { eventId: "evt_retry", type: "order.updated" },
      { transport },
    );

    assert.equal(retried.delivered, true);
    assert.equal(retried.duplicate, false);
    assert.equal(retried.attempts, 2);
    assert.equal(hasDelivered("evt_retry"), true);
  });

  it("rejects concurrent deliveries while an attempt is in flight", async () => {
    let release;
    const gate = new Promise((resolve) => {
      release = resolve;
    });

    const slowTransport = async () => {
      await gate;
    };

    const firstPromise = deliverWebhook(
      { eventId: "evt_race", type: "order.paid" },
      { transport: slowTransport },
    );

    // Claim happens synchronously before the transport await, so this races in-flight.
    const concurrent = await deliverWebhook(
      { eventId: "evt_race", type: "order.paid" },
      { transport: slowTransport },
    );

    assert.equal(concurrent.delivered, false);
    assert.equal(concurrent.duplicate, true);
    assert.equal(concurrent.retryable, false);
    assert.match(concurrent.message, /in progress/i);

    release();
    const first = await firstPromise;
    assert.equal(first.delivered, true);
    assert.equal(hasDelivered("evt_race"), true);
  });

  it("allows different eventIds to be delivered independently", async () => {
    const first = await deliverWebhook({ eventId: "evt_a", type: "a" });
    const second = await deliverWebhook({ eventId: "evt_b", type: "b" });

    assert.equal(first.delivered, true);
    assert.equal(second.delivered, true);
  });

  it("requires an eventId", async () => {
    await assert.rejects(
      () => deliverWebhook({ type: "order.created" }),
      { message: /eventId is required/ },
    );
  });

  it("does not mark an event delivered when transport fails", async () => {
    const result = await deliverWebhook(
      { eventId: "evt_fail", type: "order.cancelled" },
      {
        transport: async () => {
          throw new Error("timeout");
        },
      },
    );

    assert.equal(result.delivered, false);
    assert.equal(result.retryable, true);
    assert.equal(result.error, "timeout");
    assert.equal(hasDelivered("evt_fail"), false);
  });
});
