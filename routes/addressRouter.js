const express = require("express");
const router = express.Router();
const addressModel = require("../models/address-model");
const isLoggedIn = require("../middlewares/isLoggedIn");

router.get("/", isLoggedIn, async (req, res) => {
  let addresses = await addressModel.find({user: req.user._id});
  res.render("selectedAddresses", {addresses});
});

router.post("/collectAddress", isLoggedIn, async (req, res) => {
  try {
    let { name, number, pincode, house, street, addtype, defaultAddress } = req.body;
    let address = await addressModel.create({
      user: req.user._id,  
      name,
      Mobile_no: number,
      PinCode: pincode,
      House_no: house,
      Address: street,
      addressType: addtype,
      defaultAddress: defaultAddress ? true : false
    });
    res.redirect("/address");
  } catch (err) {
    console.error(err.message);
  }
});

module.exports = router;
