import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  addOrderNote,
  createOrder,
  getOrderById,
  resetOrders,
} from "../src/services/orderService.js";

describe("addOrderNote", () => {
  beforeEach(() => {
    resetOrders();
  });

  it("adds a short note to an existing order", () => {
    const order = createOrder({
      items: [{ name: "Acme Pro Plan", quantity: 1 }],
      payment: { method: "card", amount: 49.99 },
    });

    const note = addOrderNote(order.id, "  Ship before Friday  ");

    assert.equal(note.orderId, order.id);
    assert.equal(note.text, "Ship before Friday");
    assert.ok(note.id);
    assert.ok(note.createdAt);
    assert.equal(getOrderById(order.id).notes.length, 1);
    assert.deepEqual(getOrderById(order.id).notes[0], note);
  });

  it("rejects notes for unknown orders", () => {
    assert.throws(() => addOrderNote("ord_missing", "hello"), {
      message: /Order not found/,
    });
  });

  it("requires non-empty note text", () => {
    const order = createOrder({
      payment: { method: "card", amount: 10 },
    });

    assert.throws(() => addOrderNote(order.id, "   "), {
      message: /note text is required/,
    });
  });
});
