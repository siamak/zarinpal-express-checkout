const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../index');

async function withServer(app, run) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    await run(baseUrl);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}

function createMockClient() {
  return {
    PaymentRequest: async (input) => ({
      status: 100,
      authority: 'A0000000000000000000000000000000123456789',
      url: `https://sandbox.zarinpal.com/pg/StartPay/mock?amount=${input.Amount}`,
    }),
    PaymentVerification: async (input) => ({
      status: 100,
      message: 'Verified',
      refId: 123456789,
      authority: input.Authority,
    }),
    UnverifiedTransactions: async () => ({
      code: 100,
      message: 'success',
      authorities: ['A111', 'A222'],
    }),
    RefreshAuthority: async (input) => ({
      code: 100,
      message: `Extended ${input.Authority} for ${input.Expire}s`,
    }),
    TokenBeautifier: (token) => token.split('0000').filter(Boolean),
  };
}

test('PaymentRequest route calls PaymentRequest and returns payload', async () => {
  const calls = [];
  const client = createMockClient();
  client.PaymentRequest = async (input) => {
    calls.push(input);
    return {
      status: 100,
      authority: 'AUTH123',
      url: 'https://sandbox.zarinpal.com/pg/StartPay/AUTH123',
    };
  };

  await withServer(createApp(client), async (baseUrl) => {
    const response = await fetch(
      `${baseUrl}/payment/request?amount=50000&callbackUrl=https://example.com/verify&description=Order%20%231&email=user%40site.com&mobile=09120000000`
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, {
      status: 100,
      authority: 'AUTH123',
      url: 'https://sandbox.zarinpal.com/pg/StartPay/AUTH123',
    });
    assert.deepEqual(calls[0], {
      Amount: 50000,
      CallbackURL: 'https://example.com/verify',
      Description: 'Order #1',
      Email: 'user@site.com',
      Mobile: '09120000000',
    });
  });
});

test('PaymentVerification route calls PaymentVerification', async () => {
  const calls = [];
  const client = createMockClient();
  client.PaymentVerification = async (input) => {
    calls.push(input);
    return {
      status: 100,
      message: 'Payment verified',
      refId: 987654321,
    };
  };

  await withServer(createApp(client), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/payment/verify?Status=OK&Authority=AUTH999&Amount=50000`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, 100);
    assert.equal(body.refId, 987654321);
    assert.deepEqual(calls[0], {
      Amount: 50000,
      Authority: 'AUTH999',
    });
  });
});

test('UnverifiedTransactions route calls UnverifiedTransactions', async () => {
  const calls = [];
  const client = createMockClient();
  client.UnverifiedTransactions = async () => {
    calls.push('called');
    return { code: 100, message: 'ok', authorities: ['A1', 'A2', 'A3'] };
  };

  await withServer(createApp(client), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/payment/unverified`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.code, 100);
    assert.deepEqual(body.authorities, ['A1', 'A2', 'A3']);
    assert.equal(calls.length, 1);
  });
});

test('RefreshAuthority route calls RefreshAuthority', async () => {
  const calls = [];
  const client = createMockClient();
  client.RefreshAuthority = async (input) => {
    calls.push(input);
    return { code: 100, message: 'Authority refreshed' };
  };

  await withServer(createApp(client), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/payment/refresh/AUTHABC/3600`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.code, 100);
    assert.deepEqual(calls[0], {
      Authority: 'AUTHABC',
      Expire: 3600,
    });
  });
});

test('TokenBeautifier route calls TokenBeautifier', async () => {
  const calls = [];
  const client = createMockClient();
  client.TokenBeautifier = (token) => {
    calls.push(token);
    return ['A', '12340', '56789'];
  };

  await withServer(createApp(client), async (baseUrl) => {
    const response = await fetch(`${baseUrl}/payment/token/A0000012340056789`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.token, 'A0000012340056789');
    assert.deepEqual(body.segments, ['A', '12340', '56789']);
    assert.deepEqual(calls, ['A0000012340056789']);
  });
});
