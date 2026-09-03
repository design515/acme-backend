import { Router } from "express";
import { ordersRateLimit } from "../middleware/rateLimit.js";
import { requireSession } from "../middleware/requireSession.js";
import {
  addOrderNote,
  createOrder,
  getOrderStatusHistory,
  listOrders,
} from "../services/orderService.js";
import { getOrderActivityHistory } from "../services/activityHistoryService.js";
import { getOrderDeliveryEstimate } from "../services/deliveryEstimateService.js";

const router = Router();

router.use(ordersRateLimit);
router.use(requireSession);

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

router.get("/:orderId/activity", (req, res) => {
  try {
    const activity = getOrderActivityHistory(req.params.orderId);
    res.json({ orderId: req.params.orderId, activity });
  } catch (error) {
    const status = error.message.startsWith("Order not found") ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
});

router.get("/:orderId/status-history", (req, res) => {
  try {
    const statusHistory = getOrderStatusHistory(req.params.orderId);
    res.json({ orderId: req.params.orderId, statusHistory });
  } catch (error) {
    const status = error.message.startsWith("Order not found") ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
});

router.get("/:orderId/delivery-estimate", (req, res) => {
  try {
    const estimate = getOrderDeliveryEstimate(req.params.orderId);
    res.json(estimate);
  } catch (error) {
    const status = error.message.startsWith("Order not found") ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
});

export default router;
