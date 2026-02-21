const express = require("express");
const addressModel = require("../models/address-model");
const isLoggedIn = require("../middlewares/isLoggedIn");
const userModel = require("../models/user-model");

const router = express.Router();

router.get("/orders-place-cod", isLoggedIn, async (req, res) => {
  try {
    const userid = req.user._id;
    const addressId = req.query.addressId;

    if (!addressId) {
      return res.status(400).send("Address ID required");
    }

    const address = await addressModel.findById(addressId);
    if (!address) {
      return res.status(400).send("Address not found");
    }

    // Get user with populated cart items
    const user = await userModel.findById(userid).populate("cart.product");

    // Transform cart items to include product details with quantity
    const orderItems = user.cart
      .filter((item) => item.product != null)
      .map((item) => ({
        product: item.product,
        quantity: item.quantity || 1,
      }));

    if (orderItems.length === 0) {
      return res.status(400).send("Cart is empty");
    }

    const newOrder = {
      orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      items: orderItems,
      address: addressId,
      paymentMethod: "COD",
      status: "pending",
      createdAt: new Date(),
    };

    await userModel.findByIdAndUpdate(userid, {
      $push: { orders: newOrder },
      $set: { cart: [] },
    });

    res.render("orderSuccess", { address });
  } catch (err) {
    console.error(err.message);
    res.status(501).send("Something went wrong");
  }
});

module.exports = router;
