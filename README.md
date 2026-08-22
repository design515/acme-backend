# Acme Backend

Node.js API for Acme orders and payments.

## Features

- **Orders API rate limiting** — `express-rate-limit` on `/api/orders` (`PR #1`, john.dev)
- **Payment null-safety** — payment service rejects missing or invalid payment data instead of throwing a null pointer (`PR #2`, john.dev)
- **Dependency upgrade** — Express and rate-limit packages on current LTS-compatible versions (`PR #3`, ci-bot)

## Project structure

```
src/
├── app.js
├── index.js
├── middleware/
│   ├── rateLimit.js
│   └── requireSession.js
├── routes/
│   ├── orders.js
│   └── webhooks.js
└── services/
    ├── orderService.js
    ├── paymentService.js
    ├── sessionService.js
    └── webhookService.js
```

## Getting started

```bash
npm install
npm run dev
npm test
```

API base: http://localhost:3000

See [docs/api.md](docs/api.md) for request and response examples.

| Method | Path                         | Description                          |
| ------ | ---------------------------- | ------------------------------------ |
| GET    | `/health`                    | Health check                         |
| GET    | `/api/orders`                | List orders (session required)       |
| POST   | `/api/orders`                | Create order (session required)      |
| POST   | `/api/orders/:orderId/notes` | Add a short note to an order         |
| POST   | `/api/webhooks/deliver`      | Deliver webhook (deduped by eventId) |

## Pull requests

| PR  | Title                                          | Author   | Status |
| --- | ---------------------------------------------- | -------- | ------ |
| #1  | feat: Add rate limiting to orders API          | john.dev | Merged |
| #2  | fix: Fix null pointer exception in payment service | john.dev | Merged |
| #3  | chore: Upgrade Node.js dependencies            | ci-bot   | Merged |
