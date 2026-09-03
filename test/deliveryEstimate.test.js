import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { getOrderDeliveryEstimate } from "../src/services/deliveryEstimateService.js";
import {
  createOrder,
  resetOrders,
  updateOrderStatus,
} from "../src/services/orderService.js";

describe("getOrderDeliveryEstimate", () => {
  beforeEach(() => {
    resetOrders();
  });

  it("returns a delivery estimate for an existing pending order", () => {
    const order = createOrder({
      items: [{ name: "Notebook", quantity: 1 }],
      payment: { method: "card", amount: 12.5 },
    });

    const estimate = getOrderDeliveryEstimate(order.id);

    assert.equal(estimate.orderId, order.id);
    assert.equal(estimate.estimable, true);
    assert.equal(estimate.businessDays, 5);
    assert.ok(estimate.estimatedDeliveryDate);
    assert.ok(
      new Date(estimate.estimatedDeliveryDate).getTime() >
        new Date(order.createdAt).getTime(),
    );
  });

  it("shortens the estimate after the order ships", () => {
    const order = createOrder({
      payment: { method: "card", amount: 20 },
    });
    updateOrderStatus(order.id, "processing");
    updateOrderStatus(order.id, "shipped");

    const estimate = getOrderDeliveryEstimate(order.id);

    assert.equal(estimate.businessDays, 1);
    assert.equal(estimate.status, "shipped");
  });

  it("reports non-estimable cancelled orders", () => {
    const order = createOrder({
      payment: { method: "card", amount: 20 },
    });
    updateOrderStatus(order.id, "cancelled");

    const estimate = getOrderDeliveryEstimate(order.id);

    assert.equal(estimate.estimable, false);
    assert.equal(estimate.estimatedDeliveryDate, null);
  });

  it("rejects unknown orders", () => {
    assert.throws(() => getOrderDeliveryEstimate("ord_missing"), {
      message: /Order not found/,
    });
  });
});
