const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const addressModel = require("../models/address-model");

const userModel = require("../models/user-model");
const isLoggedIn = require("../middlewares/isLoggedIn");

router.post("/create-checkout-session", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id)
      .populate({
        path: "cart",
        model: "product"
      });

    let totalMrp = 0;
    let totalDiscount = 0;
    const platformFee = 35;

    user.cart.forEach(item => {
      if (!item) return;

      const price = Number(item.price);
      const qty = Number(item.quantity || 1);
      const discount = Number(item.discount || 0);

      const mrp = price * qty;
      const dis = (mrp * discount) / 100;

      totalMrp += mrp;
      totalDiscount += dis;
    });

    const totalAmount =
      Math.round(totalMrp - totalDiscount + platformFee);

    // Stripe expects amount in paise
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Order Payment"
            },
            unit_amount: totalAmount * 100,
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


router.get("/orders-success", isLoggedIn, async (req, res) =>{
        try {
            const userid = req.user._id;
            const address = await addressModel.findById(userid);
            // if (!address) return res.status(400).send("Address not found");
            const newOrder = {
              items: req.user.cart,           // all cart items
              address: address,           // address ID
              paymentMethod: "Stripe",
              createdAt: new Date(),
            };
            // console.log(newOrder);
            await userModel.findByIdAndUpdate(userid, {
              $push: { orders: newOrder },
              $set: { cart: [] }, // this clears cart
            });
            res.render("orderSuccess", {address});
        
          } catch (err) {
            console.error(err.message);
            res.status(501).send("Something went wrong");
          }
});

module.exports = router;
