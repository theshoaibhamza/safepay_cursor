const { Safepay } = require('@sfpy/node-sdk');
const getRawBody = require('raw-body');

function setCorsHeaders(res) {
  const allowedOrigin = process.env.CORS_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const environment = process.env.SAFEPAY_ENVIRONMENT || 'sandbox';
    const safepay = new Safepay({
      environment,
      apiKey: process.env.SAFEPAY_API_KEY,
      v1Secret: process.env.SAFEPAY_V1_SECRET,
      webhookSecret: process.env.SAFEPAY_WEBHOOK_SECRET
    });

    let body = req.body || {};
    if (!Object.keys(body || {}).length && req.method === 'POST') {
      const raw = await getRawBody(req);
      const text = raw.toString('utf8');
      body = text ? JSON.parse(text) : {};
    }
    const { amount, currency, orderId, redirectUrl, cancelUrl } = body;

    if (!amount || !currency || !orderId) {
      return res.status(400).json({ error: 'amount, currency and orderId are required' });
    }

    const session = await safepay.payments.create({ amount, currency });
    const checkoutUrl = safepay.checkout.create({
      token: session.token,
      orderId,
      redirectUrl: redirectUrl || process.env.SAFEPAY_REDIRECT_URL || 'https://example.com/success',
      cancelUrl: cancelUrl || process.env.SAFEPAY_CANCEL_URL || 'https://example.com/cancel',
      webhooks: true
    });

    return res.status(200).json({ checkoutUrl, orderId, token: session.token });
  } catch (error) {
    console.error('create-payment error:', error);
    return res.status(500).json({ error: 'Failed to create payment session' });
  }
};



//