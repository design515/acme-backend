import { chargePayment } from "./paymentService.js";

const orders = [];

export function createOrder({ items = [], payment } = {}) {
  const charge = chargePayment(payment);

  const order = {
    id: `ord_${orders.length + 1}`,
    items,
    total: charge.amount,
    payment: charge,
    createdAt: new Date().toISOString(),
  };

  orders.push(order);
  return order;
}

export function listOrders() {
  return orders;
}
