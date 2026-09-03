import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { parseOrderDate, toOrderDateIso } from "../src/services/orderDate.js";
import { createOrder, resetOrders } from "../src/services/orderService.js";

describe("parseOrderDate", () => {
  it("parses a valid ISO date string", () => {
    const parsed = parseOrderDate("2026-09-03T10:00:00.000Z", "createdAt");
    assert.equal(parsed.toISOString(), "2026-09-03T10:00:00.000Z");
  });

  it("rejects empty values", () => {
    assert.throws(() => parseOrderDate("", "createdAt"), {
      message: /Invalid createdAt format/,
    });
    assert.throws(() => parseOrderDate("   ", "createdAt"), {
      message: /Invalid createdAt format/,
    });
  });

  it("rejects non-date garbage strings", () => {
    assert.throws(() => parseOrderDate("not-a-date", "createdAt"), {
      message: /Invalid createdAt format/,
    });
  });

  it("rejects bare numeric timestamps without a date format", () => {
    assert.throws(() => parseOrderDate("1693737600000", "createdAt"), {
      message: /Invalid createdAt format/,
    });
  });
});

describe("createOrder createdAt handling", () => {
  beforeEach(() => {
    resetOrders();
  });

  it("accepts a valid createdAt override", () => {
    const order = createOrder({
      payment: { method: "card", amount: 15 },
      createdAt: "2026-08-01T12:00:00.000Z",
    });

    assert.equal(order.createdAt, "2026-08-01T12:00:00.000Z");
    assert.equal(toOrderDateIso(order.createdAt), order.createdAt);
  });

  it("rejects an invalid createdAt value", () => {
    assert.throws(
      () =>
        createOrder({
          payment: { method: "card", amount: 15 },
          createdAt: "yesterday-ish",
        }),
      { message: /Invalid createdAt format/ },
    );
  });
});
