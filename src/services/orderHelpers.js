export const ORDER_STATUSES = Object.freeze([
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export function assertValidOrderId(orderId) {
  if (!orderId || typeof orderId !== "string") {
    throw new Error("orderId is required");
  }
}

export function assertValidStatus(status) {
  if (!ORDER_STATUSES.includes(status)) {
    throw new Error(`Invalid order status: ${status}`);
  }
}

export function appendStatusChange(
  order,
  nextStatus,
  changedAt = new Date().toISOString(),
) {
  const entry = {
    id: `status_${order.statusHistory.length + 1}`,
    orderId: order.id,
    from: order.status ?? null,
    to: nextStatus,
    changedAt,
  };

  order.statusHistory.push(entry);
  order.status = nextStatus;
  return entry;
}
