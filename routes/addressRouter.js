const express = require("express");
const router = express.Router();
const userModel = require("../models/user-model");
const addressModel = require("../models/address-model");
const isLoggedIn = require("../middlewares/isLoggedIn");

router.post("/address", isLoggedIn, async (req, res) => {
  res.redirect("/address/placeorder");
});

router.get("/placeorder", isLoggedIn, async (req, res) => {
  const addresses = await addressModel
    .find({ user: req.user._id })
    .sort({ defaultAddress: -1, createdAt: 1 });
  const user = await userModel.findById(req.user._id).populate("cart.product");

  // Transform cart items to include product details with quantity
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

  // console.log(user, addresses);
  res.render("placeOrder", { cartItems, addresses });
});

router.post("/collectAddress", isLoggedIn, async (req, res) => {
  try {
    let { name, number, pincode, house, street, addtype, defaultAddress } =
      req.body;

    if (defaultAddress) {
      await addressModel.updateMany(
        { user: req.user._id },
        { $set: { defaultAddress: false } },
      );
    }

    let address = await addressModel.create({
      user: req.user._id,
      name,
      Mobile_no: number,
      PinCode: pincode,
      House_no: house,
      Address: street,
      addressType: addtype,
      defaultAddress: defaultAddress ? true : false,
    });

    await userModel.findByIdAndUpdate(req.user._id, {
      $push: { Address: address._id },
    });

    // Check if request expects JSON (AJAX)
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      res.json({
        success: true,
        message: "Address created successfully",
        address: address,
      });
    } else {
      // Fallback for regular form submission
      res.redirect("/address/placeorder");
    }
  } catch (err) {
    console.error(err.message);

    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      res.status(500).json({
        success: false,
        message: "Failed to create address. Please try again.",
      });
    } else {
      res.status(500).send("Something went wrong");
    }
  }
});

module.exports = router;
