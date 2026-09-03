import { chargePayment } from "./paymentService.js";
import { toOrderDateIso } from "./orderDate.js";

const orders = [];

export const ORDER_STATUSES = Object.freeze([
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

function assertValidOrderId(orderId) {
  if (!orderId || typeof orderId !== "string") {
    throw new Error("orderId is required");
  }
}

function assertValidStatus(status) {
  if (!ORDER_STATUSES.includes(status)) {
    throw new Error(`Invalid order status: ${status}`);
  }
}

function appendStatusChange(order, nextStatus, changedAt = new Date().toISOString()) {
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

export function createOrder({ items = [], payment, createdAt: createdAtInput } = {}) {
  const charge = chargePayment(payment);
  const createdAt = createdAtInput
    ? toOrderDateIso(createdAtInput, "createdAt")
    : new Date().toISOString();

  const order = {
    id: `ord_${orders.length + 1}`,
    items,
    total: charge.amount,
    payment: charge,
    notes: [],
    status: null,
    statusHistory: [],
    createdAt,
  };

  appendStatusChange(order, "pending", createdAt);
  orders.push(order);
  console.log(
    `[orders] created order id=${order.id} items=${order.items.length} total=${order.total}`,
  );
  return order;
}

export function listOrders() {
  console.log(`[orders] retrieved ${orders.length} order(s)`);
  return orders;
}

export function getOrderById(orderId) {
  return orders.find((order) => order.id === orderId) ?? null;
}

/**
 * Attach a short text note to an existing order.
 */
export function addOrderNote(orderId, text) {
  assertValidOrderId(orderId);

  const noteText = typeof text === "string" ? text.trim() : "";
  if (!noteText) {
    throw new Error("note text is required");
  }

  const order = getOrderById(orderId);
  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  const note = {
    id: `note_${order.notes.length + 1}`,
    orderId: order.id,
    text: noteText,
    createdAt: new Date().toISOString(),
  };

  order.notes.push(note);
  return note;
}

/**
 * Transition an order to a new status and append a history entry.
 */
export function updateOrderStatus(orderId, nextStatus) {
  assertValidOrderId(orderId);
  assertValidStatus(nextStatus);

  const order = getOrderById(orderId);
  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  if (order.status === nextStatus) {
    throw new Error(`Order is already ${nextStatus}`);
  }

  return appendStatusChange(order, nextStatus);
}

/**
 * Return status changes for an order in chronological order.
 */
export function getOrderStatusHistory(orderId) {
  assertValidOrderId(orderId);

  const order = getOrderById(orderId);
  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }

  return [...order.statusHistory].sort(
    (left, right) =>
      new Date(left.changedAt).getTime() - new Date(right.changedAt).getTime(),
  );
}

/** Test helper — clears in-memory orders. */
export function resetOrders() {
  orders.length = 0;
}
