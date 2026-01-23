const express = require("express");
const router = express.Router();
const userModel = require("../models/user-model");
const addressModel = require("../models/address-model");
const isLoggedIn = require("../middlewares/isLoggedIn");

router.post("/address", isLoggedIn, async (req, res) => {
  console.log("hiii..")
  res.redirect("/address/placeorder");
});


router.get("/placeorder", isLoggedIn, async (req, res) => {
  const addresses = await addressModel
    .find({ user: req.user._id })
    .sort({ defaultAddress: -1, createdAt: 1 });
  const user = await userModel.findById(req.user._id).populate("cart");
  // console.log(user, addresses);
  res.render("placeOrder", { cartItems: user.cart, addresses });
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

    res.redirect("/address/placeorder");
  } catch (err) {
    console.error(err.message);
  }
});

module.exports = router;
