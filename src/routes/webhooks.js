import { Router } from "express";
import { deliverWebhook } from "../services/webhookService.js";

const router = Router();

router.post("/deliver", (req, res) => {
  try {
    const result = deliverWebhook(req.body);

    if (result.duplicate) {
      return res.status(409).json(result);
    }

    return res.status(202).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

export default router;
