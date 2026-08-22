import { chargePayment } from "./paymentService.js";

const orders = [];

export function createOrder({ items = [], payment } = {}) {
  const charge = chargePayment(payment);

  const order = {
    id: `ord_${orders.length + 1}`,
    items,
    total: charge.amount,
    payment: charge,
    notes: [],
    createdAt: new Date().toISOString(),
  };

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
  if (!orderId || typeof orderId !== "string") {
    throw new Error("orderId is required");
  }

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

/** Test helper — clears in-memory orders. */
export function resetOrders() {
  orders.length = 0;
}
