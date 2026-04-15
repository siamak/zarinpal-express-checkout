# ZarinPal Express Checkout

[![npm version](https://img.shields.io/npm/v/zarinpal-checkout.svg)](https://www.npmjs.com/package/zarinpal-checkout)
[![npm total downloads](https://img.shields.io/npm/dt/zarinpal-checkout?label=total%20downloads)](https://www.npmjs.com/package/zarinpal-checkout)
[![CI](https://github.com/siamak/zarinpal-checkout/actions/workflows/ci.yml/badge.svg)](https://github.com/siamak/zarinpal-checkout/actions/workflows/ci.yml)
[![Wiki](https://img.shields.io/badge/Wiki-Documentation-blue)](https://github.com/siamak/zarinpal-checkout/wiki)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Express demo app for `zarinpal-checkout` v1 APIs.

This project uses the modern `zarinpal-checkout` package while keeping the familiar method names:

- `PaymentRequest`
- `PaymentVerification`
- `UnverifiedTransactions`
- `RefreshAuthority`
- `TokenBeautifier`

If you want the core package documentation, see the original repository README:
[`zarinpal-checkout`](https://github.com/siamak/zarinpal-checkout/raw/refs/heads/main/README.md)

## Package Note
This repository is an Express integration example for the npm package
[`zarinpal-checkout`](https://www.npmjs.com/package/zarinpal-checkout), not the core package source code.
- Core package repository: [`siamak/zarinpal-checkout`](https://github.com/siamak/zarinpal-checkout)
- Core package README: [`README.md`](https://github.com/siamak/zarinpal-checkout/raw/refs/heads/main/README.md)
  
## Features

- Express 5 demo routes for all major checkout methods
- Environment-based configuration via `.env`
- Supports sandbox/production mode
- Uses `createWithOptions` when available, with backward-compatible fallback to `create`
- Node.js built-in test runner for route coverage

## Requirements

- Node.js `>=18`

## Installation

```bash
npm install
```

## Configuration

Create `.env` (or copy from `.env.example`) and set:

```env
ZARINPAL_MERCHANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ZARINPAL_CALLBACK_URL=https://example.com/payment/verify
ZARINPAL_SANDBOX=true
PORT=9990
```

### Notes

- `ZARINPAL_SANDBOX` defaults to `true` unless explicitly set to `false`.
- Currency is configured as `IRT` in this demo.

## Run

```bash
npm start
```

## Routes

- `GET /payment/request`
- `GET /payment/verify`
- `GET /payment/unverified`
- `GET /payment/refresh/:authority/:expire`
- `GET /payment/token/:token`
- `GET /health`

### Example requests

```bash
curl "http://localhost:9990/payment/request?amount=1000&description=Order%20%23123"
```

```bash
curl "http://localhost:9990/payment/verify?Status=OK&Authority=A00000000000000000000000000123456789&Amount=1000"
```

```bash
curl "http://localhost:9990/payment/unverified"
```

## Tests

```bash
npm test
```

## License

MIT
