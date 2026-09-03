import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ORDER_STATUSES,
  assertValidOrderId,
  assertValidStatus,
} from "../src/services/orderHelpers.js";

describe("orderHelpers", () => {
  it("exposes the supported order statuses", () => {
    assert.ok(ORDER_STATUSES.includes("pending"));
    assert.ok(ORDER_STATUSES.includes("shipped"));
  });

  it("validates order ids", () => {
    assert.doesNotThrow(() => assertValidOrderId("ord_1"));
    assert.throws(() => assertValidOrderId(""), {
      message: /orderId is required/,
    });
  });

  it("validates order statuses", () => {
    assert.doesNotThrow(() => assertValidStatus("processing"));
    assert.throws(() => assertValidStatus("unknown"), {
      message: /Invalid order status/,
    });
  });
});
