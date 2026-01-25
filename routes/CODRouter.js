const express = require("express");
const addressModel = require("../models/address-model");
const isLoggedIn = require("../middlewares/isLoggedIn");
const userModel = require("../models/user-model");

const router = express.Router();

router.get("/orders-place-cod", isLoggedIn, async (req, res) => {
  try {
    const userid = req.user._id;
    const address = await addressModel.findById(userid);
    // if (!address) return res.status(400).send("Address not found");
    const newOrder = {
      items: req.user.cart,           // all cart items
      address: address,           // address ID
      paymentMethod: "COD",
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
