# API documentation

Base URL: `http://localhost:3000`

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
