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
│   └── rateLimit.js
├── routes/
│   └── orders.js
└── services/
    ├── orderService.js
    └── paymentService.js
```

## Getting started

```bash
npm install
npm run dev
```

API base: http://localhost:3000

| Method | Path                          | Description                          |
| ------ | ----------------------------- | ------------------------------------ |
| GET    | `/health`                     | Health check                         |
| GET    | `/api/orders`                 | List orders (rate limited)           |
| POST   | `/api/orders`                 | Create order (rate limited)          |
| GET    | `/api/orders/export`          | Export orders as JSON (mock)         |
| GET    | `/api/orders/export?format=csv` | Export orders as CSV (mock)        |

## Pull requests

| PR  | Title                                          | Author   | Status |
| --- | ---------------------------------------------- | -------- | ------ |
| #1  | feat: Add rate limiting to orders API          | john.dev | Merged |
| #2  | fix: Fix null pointer exception in payment service | john.dev | Merged |
| #3  | chore: Upgrade Node.js dependencies            | ci-bot   | Merged |
