import { Router } from "express";
import { ordersRateLimit } from "../middleware/rateLimit.js";
import {
  addOrderNote,
  createOrder,
  listOrders,
} from "../services/orderService.js";

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

router.post("/:orderId/notes", (req, res) => {
  try {
    const note = addOrderNote(req.params.orderId, req.body?.text ?? req.body?.note);
    res.status(201).json(note);
  } catch (error) {
    const status = error.message.startsWith("Order not found") ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
});

export default router;
