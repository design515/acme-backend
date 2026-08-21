import { chargePayment } from "./paymentService.js";

const orders = [];

const mockOrders = [
  {
    id: "ord_mock_1",
    items: [{ name: "Acme Pro Plan", quantity: 1 }],
    total: 49.99,
    createdAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "ord_mock_2",
    items: [{ name: "Team Add-on", quantity: 2 }],
    total: 39.98,
    createdAt: "2026-08-10T14:30:00.000Z",
  },
];

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
  return orders.length > 0 ? orders : mockOrders;
}

export function exportOrders(format = "json") {
  const data = listOrders();

  if (format === "csv") {
    const header = "id,total,createdAt,itemCount";
    const rows = data.map(
      (order) =>
        `${order.id},${order.total},${order.createdAt},${order.items?.length ?? 0}`,
    );
    return { contentType: "text/csv", body: [header, ...rows].join("\n") };
  }

  return {
    contentType: "application/json",
    body: {
      exportedAt: new Date().toISOString(),
      count: data.length,
      orders: data,
    },
  };
}
