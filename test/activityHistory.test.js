import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  getOrderActivityHistory,
  resetActivityHistory,
} from "../src/services/activityHistoryService.js";
import { createOrder, resetOrders } from "../src/services/orderService.js";

describe("getOrderActivityHistory", () => {
  beforeEach(() => {
    resetOrders();
    resetActivityHistory();
  });

  it("returns a chronological activity timeline for an existing order", () => {
    const order = createOrder({
      items: [{ name: "Desk Lamp", quantity: 1 }],
      payment: { method: "card", amount: 39.99 },
    });

    const timeline = getOrderActivityHistory(order.id);

    assert.ok(timeline.length >= 3);
    assert.equal(timeline[0]?.orderId, order.id);
    assert.equal(timeline[0]?.kind, "created");
    assert.ok(timeline[0]?.occurredAt);
    assert.ok(
      new Date(timeline[0].occurredAt).getTime() <=
        new Date(timeline.at(-1).occurredAt).getTime(),
    );
  });

  it("rejects activity lookups for unknown orders", () => {
    assert.throws(() => getOrderActivityHistory("ord_missing"), {
      message: /Order not found/,
    });
  });
});
