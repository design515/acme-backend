import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  createOrder,
  getOrderStatusHistory,
  resetOrders,
  updateOrderStatus,
} from "../src/services/orderService.js";

describe("getOrderStatusHistory", () => {
  beforeEach(() => {
    resetOrders();
  });

  it("returns chronological status changes for an existing order", () => {
    const order = createOrder({
      items: [{ name: "Desk Lamp", quantity: 1 }],
      payment: { method: "card", amount: 39.99 },
    });

    updateOrderStatus(order.id, "processing");
    updateOrderStatus(order.id, "shipped");

    const history = getOrderStatusHistory(order.id);

    assert.equal(history.length, 3);
    assert.equal(history[0].from, null);
    assert.equal(history[0].to, "pending");
    assert.equal(history[1].to, "processing");
    assert.equal(history[2].to, "shipped");
    assert.ok(
      new Date(history[0].changedAt).getTime() <=
        new Date(history[2].changedAt).getTime(),
    );
    assert.equal(history.every((entry) => entry.orderId === order.id), true);
  });

  it("returns an empty history when an order has no status changes recorded", () => {
    const order = createOrder({
      payment: { method: "card", amount: 10 },
    });
    order.statusHistory.length = 0;

    const history = getOrderStatusHistory(order.id);

    assert.deepEqual(history, []);
  });

  it("rejects lookups for non-existing orders", () => {
    assert.throws(() => getOrderStatusHistory("ord_missing"), {
      message: /Order not found/,
    });
  });

  it("rejects invalid order ids", () => {
    assert.throws(() => getOrderStatusHistory(""), {
      message: /orderId is required/,
    });
    assert.throws(() => getOrderStatusHistory(null), {
      message: /orderId is required/,
    });
  });
});

describe("updateOrderStatus", () => {
  beforeEach(() => {
    resetOrders();
  });

  it("rejects invalid status values", () => {
    const order = createOrder({
      payment: { method: "card", amount: 10 },
    });

    assert.throws(() => updateOrderStatus(order.id, "not-a-status"), {
      message: /Invalid order status/,
    });
  });

  it("rejects duplicate status transitions", () => {
    const order = createOrder({
      payment: { method: "card", amount: 10 },
    });

    assert.throws(() => updateOrderStatus(order.id, "pending"), {
      message: /already pending/,
    });
  });
});
