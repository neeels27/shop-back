const stripe = require("stripe")("sk_test_51KhvbcGngQynqlmBQ6bMkjgu0BNuUZ5T8h7W5nciY7KcpHapvBlqOVLto5Sa3UYp9la4gAI2XRBvuccnUPAhbQs400kiX37KyQ");

const initiateStripeSession = async (req) => {

  console.log(req.user);

  const priceDataArray = [];

  req.body.cart.forEach((element) => {
    priceDataArray.push({
      price_data: {
        currency: "eur",
        product_data: {
          name: element.title,
        },
        unit_amount: element.price * 100,
      },
      quantity: element.qty,
    });
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: priceDataArray,
    payment_intent_data: {
      metadata: { userId: req.user.id, cart: JSON.stringify(req.body.cart) },
    },
    mode: "payment",
    success_url: `http://localhost:3001/confirmation?amount=${req.body.total}`,
    cancel_url: `http://localhost:3001/cancel`,
  });
  return session;
};

exports.createSession = async function (req, res) {
  try {
    const session = await initiateStripeSession(req);
    res.status(200).json({
      id: session.id,
      price: session.amout_total,
      currency: session.currency,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};
