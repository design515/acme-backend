export function chargePayment(payment) {
  if (!payment) {
    throw new Error("Payment details are required");
  }

  const method = payment.method ?? "unknown";
  const amount = Number(payment.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Payment amount is invalid");
  }

  return {
    status: "charged",
    method,
    amount,
    transactionId: payment.transactionId ?? `txn_${Date.now()}`,
  };
}
