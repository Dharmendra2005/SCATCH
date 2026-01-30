const express = require("express");
const isLoggedIn = require("../middlewares/isLoggedIn");
const userModel = require("../models/user-model");
const addressModel = require("../models/address-model");

const router = express.Router();

router.get("/create-upi-session", isLoggedIn, async (req, res) => {
  try {
    const address = await addressModel.findOne({ user: req.user._id });
    const user = await userModel
      .findById(req.user._id)
      .populate("cart.product");
    const cartItems =
      user.cart.map((item) => ({
        _id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        discount: item.product.discount,
        image: item.product.image,
        bgcolor: item.product.bgcolor,
        panelcolor: item.product.panelcolor,
        textcolor: item.product.textcolor,
        quantity: item.quantity,
      })) || [];


      const newOrder = {
            items: req.user.cart,           // all cart items
            address: address,           // address ID
            paymentMethod: "UPI",
            createdAt: new Date(),
          };
          await userModel.findByIdAndUpdate(req.user._id, {
            $push: { orders: newOrder },
            $set: { cart: [] }, // this clears cart
          });
    res.render("upiSession", { cartItems, address });
  } catch (err) {
    res.status(500).json({ error: "UPI session creation failed" });
  }
});

module.exports = router;
