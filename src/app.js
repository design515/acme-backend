import express from "express";
import ordersRouter from "./routes/orders.js";
import webhooksRouter from "./routes/webhooks.js";

export function createApp() {
  const app = express();

  app.use(express.json());
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  app.use("/api/orders", ordersRouter);
  app.use("/api/webhooks", webhooksRouter);

  return app;
}
