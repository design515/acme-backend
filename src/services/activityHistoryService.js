import { getOrderById } from "./orderService.js";

const timelines = new Map();

function buildTimelineForOrder(order) {
  const baseTime = new Date(order.createdAt).getTime();

  return [
    {
      id: `${order.id}_act_1`,
      orderId: order.id,
      kind: "created",
      actor: "system",
      summary: "Order received",
      occurredAt: new Date(baseTime).toISOString(),
    },
    {
      id: `${order.id}_act_2`,
      orderId: order.id,
      kind: "payment_captured",
      actor: "billing",
      summary: "Payment captured successfully",
      occurredAt: new Date(baseTime + 5 * 60 * 1000).toISOString(),
    },
    {
      id: `${order.id}_act_3`,
      orderId: order.id,
      kind: "fulfillment_started",
      actor: "warehouse",
      summary: "Fulfillment workflow started",
      occurredAt: new Date(baseTime + 30 * 60 * 1000).toISOString(),
    },
  ];
}

export function getOrderActivityHistory(orderId) {
  if (!orderId || typeof orderId !== "string") {
    throw new Error("orderId is required");
  }

  const order = getOrderById(orderId);
  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  if (!timelines.has(orderId)) {
    timelines.set(orderId, buildTimelineForOrder(order));
  }

  return [...timelines.get(orderId)].sort(
    (left, right) =>
      new Date(left.occurredAt).getTime() - new Date(right.occurredAt).getTime(),
  );
}

/** Test helper — clears cached activity timelines. */
export function resetActivityHistory() {
  timelines.clear();
}
