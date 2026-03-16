// Stripe billing — placeholder
// Configure STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in env

const PRICE_IDS = {
  starter: 'price_1TBdpM2dvwjzjXFJHAqVWUuR',
  pro: 'price_1TBdpN2dvwjzjXFJLUhXUEJ6',
};

const createCheckoutSession = async (plan, successUrl, cancelUrl) => {
  const priceId = PRICE_IDS[plan];
  if (!priceId) {
    throw new Error(`Unknown plan: ${plan}. Valid plans: ${Object.keys(PRICE_IDS).join(', ')}`);
  }

  // TODO: initialize Stripe and create real session
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  // return stripe.checkout.sessions.create({ ... });

  return {
    url: `https://checkout.stripe.com/placeholder/${plan}`,
    plan,
    priceId,
    successUrl,
    cancelUrl,
  };
};

const handleWebhook = (rawBody, signature) => {
  // TODO: verify signature with STRIPE_WEBHOOK_SECRET
  const event = JSON.parse(rawBody);
  console.log(`[stripe] Received event: ${event.type}`);
  return { type: event.type };
};

export { createCheckoutSession, handleWebhook, PRICE_IDS };
