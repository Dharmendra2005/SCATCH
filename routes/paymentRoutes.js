const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


router.post("/create-checkout-session", async (req, res) => {
  try {
    const cartItems = req.session.cart || [];

    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart empty" });
    }

    const line_items = cartItems.map(item => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100, // ₹ → paise
      },
      quantity: item.quantity || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      payment_method_types: [
        "card",
        "upi"
      ],

      line_items,

      success_url: "http://localhost:3000/payment/success",
      cancel_url: "http://localhost:3000/payment/cancel",
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Stripe error" });
  }
});
