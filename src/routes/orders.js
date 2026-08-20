import { Router } from "express";
import { ordersRateLimit } from "../middleware/rateLimit.js";
import { createOrder, listOrders } from "../services/orderService.js";

const router = Router();

router.use(ordersRateLimit);

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
