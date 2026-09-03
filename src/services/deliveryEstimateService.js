import { getOrderById } from "./orderService.js";

const ESTIMATE_DAYS_BY_STATUS = Object.freeze({
  pending: 5,
  processing: 3,
  shipped: 1,
  delivered: 0,
  cancelled: null,
});

/**
 * Build a delivery estimate for an existing order based on its status.
 */
export function getOrderDeliveryEstimate(orderId) {
  if (!orderId || typeof orderId !== "string") {
    throw new Error("orderId is required");
  }

  const order = getOrderById(orderId);
  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  if (order.status === "cancelled") {
    return {
      orderId: order.id,
      status: order.status,
      estimable: false,
      businessDays: null,
      estimatedDeliveryDate: null,
      message: "Cancelled orders do not have a delivery estimate",
    };
  }

  const businessDays = ESTIMATE_DAYS_BY_STATUS[order.status] ?? 5;
  const base = new Date(order.createdAt);
  const estimated = new Date(base);
  estimated.setUTCDate(estimated.getUTCDate() + businessDays);

  return {
    orderId: order.id,
    status: order.status,
    estimable: true,
    businessDays,
    estimatedDeliveryDate: estimated.toISOString(),
  };
}
