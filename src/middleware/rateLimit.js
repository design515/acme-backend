import rateLimit from "express-rate-limit";

export const ordersRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many order requests. Please try again later.",
  },
});
