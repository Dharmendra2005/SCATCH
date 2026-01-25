const express = require("express");
const router = express.Router();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("Stripe secret key is missing! Check .env file.");
}

const stripe = require("stripe")(stripeSecretKey);

router.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: "Test Product" },
            unit_amount: 50000, // ₹500.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.protocol}://${req.get("host")}/orders/success`,
      cancel_url: `${req.protocol}://${req.get("host")}/orders/cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Stripe session creation failed" });
  }
});

router.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // payment options
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: "Test Product" },
            unit_amount: 50000, // ₹500.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.protocol}://${req.get("host")}/stripe/orders-success`,
      cancel_url: `${req.protocol}://${req.get("host")}/orders/cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Stripe session creation failed" });
  }
});

router.get("/test", async (req, res) => {
  try {
    const products = await stripe.products.list({ limit: 1 });
    res.send(products);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
