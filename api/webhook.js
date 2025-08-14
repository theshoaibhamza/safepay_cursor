const getRawBody = require('raw-body');
const { Safepay } = require('@sfpy/node-sdk');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const rawBody = await getRawBody(req);
    const payloadString = rawBody.toString('utf8');

    const environment = process.env.SAFEPAY_ENVIRONMENT || 'sandbox';
    const safepay = new Safepay({
      environment,
      apiKey: process.env.SAFEPAY_API_KEY,
      v1Secret: process.env.SAFEPAY_V1_SECRET,
      webhookSecret: process.env.SAFEPAY_WEBHOOK_SECRET
    });

    // Optional: verify webhook signature if supported by SDK
    // const verified = await safepay.verify.webhook({ headers: req.headers, rawBody });
    // if (!verified) return res.status(400).send('Invalid webhook signature');

    const { event, data } = JSON.parse(payloadString);

    console.log('Webhook event:', event);
    if (event === 'payment_intent.succeeded') {
      console.log(`Payment for order ${data.order_id} succeeded`);
      // Update your database here
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('webhook error:', error);
    return res.status(500).end();
  }
};

module.exports.config = {
  api: {
    bodyParser: false
  }
};


