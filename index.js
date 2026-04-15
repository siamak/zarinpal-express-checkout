'use strict';

require('dotenv').config();

const express = require('express');
const ZarinpalCheckout = require('zarinpal-checkout');

const DEFAULT_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID || 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
const DEFAULT_CALLBACK_URL = process.env.ZARINPAL_CALLBACK_URL || 'https://example.com/payment/verify';

function createClient() {
  const useSandbox = process.env.ZARINPAL_SANDBOX !== 'false';
  const createWithOptions = ZarinpalCheckout.createWithOptions;

  if (typeof createWithOptions === 'function') {
    return createWithOptions(DEFAULT_MERCHANT_ID, {
      sandbox: useSandbox,
      currency: 'IRT',
      timeoutMs: 10000,
    });
  }

  // Fallback for older builds that only expose create().
  return ZarinpalCheckout.create(DEFAULT_MERCHANT_ID, useSandbox, 'IRT');
}

function createApp(zarinpalClient) {
  const app = express();
  const zarinpal = zarinpalClient || createClient();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.get('/payment/request', async function paymentRequest(req, res) {
    try {
      const response = await zarinpal.PaymentRequest({
        Amount: Number(req.query.amount || 1000),
        CallbackURL: String(req.query.callbackUrl || DEFAULT_CALLBACK_URL),
        Description: String(req.query.description || 'Hello NodeJS API.'),
        Email: req.query.email ? String(req.query.email) : undefined,
        Mobile: req.query.mobile ? String(req.query.mobile) : undefined,
      });

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ message: 'PaymentRequest failed', error });
    }
  });

  app.get('/payment/verify', async function paymentVerification(req, res) {
    const status = String(req.query.Status || '');
    const authority = String(req.query.Authority || '');

    if (status && status !== 'OK') {
      return res.status(400).json({ message: 'Payment cancelled by user.' });
    }

    if (!authority) {
      return res.status(400).json({ message: 'Missing Authority query param.' });
    }

    try {
      const response = await zarinpal.PaymentVerification({
        Amount: Number(req.query.Amount || req.query.amount || 1000),
        Authority: authority,
      });

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ message: 'PaymentVerification failed', error });
    }
  });

  app.get('/payment/unverified', async function unverifiedTransactions(req, res) {
    try {
      const response = await zarinpal.UnverifiedTransactions();
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ message: 'UnverifiedTransactions failed', error });
    }
  });

  app.get('/payment/refresh/:authority/:expire', async function refreshAuthority(req, res) {
    try {
      const response = await zarinpal.RefreshAuthority({
        Authority: req.params.authority,
        Expire: Number(req.params.expire),
      });

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ message: 'RefreshAuthority failed', error });
    }
  });

  app.get('/payment/token/:token', function tokenBeautifier(req, res) {
    const segments = zarinpal.TokenBeautifier(req.params.token);
    return res.status(200).json({ token: req.params.token, segments });
  });

  app.get('/health', function health(req, res) {
    return res.status(200).json({
      ok: true,
      package: 'zarinpal-checkout',
      version: ZarinpalCheckout.version || null,
    });
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = Number(process.env.PORT || 9990);

  app.listen(port, function onListen() {
    console.log('App is running on port %d.', port);
  });
}

module.exports = {
  createApp,
  createClient,
};
