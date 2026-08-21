import { Router } from "express";
import { ordersRateLimit } from "../middleware/rateLimit.js";
import {
  createOrder,
  exportOrders,
  listOrders,
} from "../services/orderService.js";

const router = Router();

router.use(ordersRateLimit);

router.get("/export", (req, res) => {
  const format = req.query.format === "csv" ? "csv" : "json";
  const result = exportOrders(format);

  res.setHeader("Content-Type", result.contentType);
  if (format === "csv") {
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="orders-export.csv"',
    );
    return res.send(result.body);
  }

  return res.json(result.body);
});

router.get("/", (_req, res) => {
  res.json({ orders: listOrders() });
});

router.post("/", (req, res) => {
  try {
    const order = createOrder(req.body);
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
