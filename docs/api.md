# API documentation

Base URL: `http://localhost:3000`

Order endpoints require an active session token:

```bash
-H "Authorization: Bearer <session-token>"
```

Expired or missing tokens receive `401` with `{ "error": "Session expired" }` or `{ "error": "Unauthorized" }`.

## Create order

`POST /api/orders`

Creates a new order. Requests are rate limited.

### Request example

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "name": "Acme Pro Plan", "quantity": 1 }
    ],
    "payment": {
      "method": "card",
      "amount": 49.99,
      "transactionId": "txn_demo_001"
    }
  }'
```

### Success response (`201`)

```json
{
  "id": "ord_1",
  "items": [
    { "name": "Acme Pro Plan", "quantity": 1 }
  ],
  "total": 49.99,
  "payment": {
    "status": "charged",
    "method": "card",
    "amount": 49.99,
    "transactionId": "txn_demo_001"
  },
  "createdAt": "2026-08-21T15:00:00.000Z"
}
```

### Error response (`400`)

```json
{
  "error": "Payment details are required"
}
```

## Add order note

`POST /api/orders/:orderId/notes`

Attaches a short text note to an existing order.

### Request example

```bash
curl -X POST http://localhost:3000/api/orders/ord_1/notes \
  -H "Content-Type: application/json" \
  -d '{ "text": "Ship before Friday" }'
```

### Success response (`201`)

```json
{
  "id": "note_1",
  "orderId": "ord_1",
  "text": "Ship before Friday",
  "createdAt": "2026-08-21T15:05:00.000Z"
}
```

## Order status history

`GET /api/orders/:orderId/status-history`

Returns status transitions for an order in chronological order. Requires an active session.

### Success response (`200`)

```json
{
  "orderId": "ord_1",
  "statusHistory": [
    {
      "id": "status_1",
      "orderId": "ord_1",
      "from": null,
      "to": "pending",
      "changedAt": "2026-08-21T15:00:00.000Z"
    },
    {
      "id": "status_2",
      "orderId": "ord_1",
      "from": "pending",
      "to": "processing",
      "changedAt": "2026-08-21T15:10:00.000Z"
    }
  ]
}
```

### Error responses

- `404` — `{ "error": "Order not found: ord_missing" }`
- `400` — `{ "error": "orderId is required" }`

## Health check

`GET /health`

```bash
curl http://localhost:3000/health
```

```json
{
  "status": "ok"
}
```
