const express = require("express");
const isLoggedIn = require("../middlewares/isLoggedIn");
const userModel = require("../models/user-model");
const addressModel = require("../models/address-model");
const QRCode = require("qrcode");

const router = express.Router();

// Your UPI details
const UPI_ID = "636@ybl";  // ← Replace with your real UPI ID
const MERCHANT_NAME = "SCATCH";  // ← Replace with your name/store name

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

    // Calculate total amount
    let totalAmount = 0;
    cartItems.forEach(item => {
      const price = Number(item.price);
      const qty = Number(item.quantity || 1);
      const discount = Number(item.discount || 0);
      const mrp = price * qty;
      const dis = (mrp * discount) / 100;  
      totalAmount += (mrp - dis);
    });
    totalAmount += 35; // Platform fee

    // Generate UPI payment link
    const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${totalAmount.toFixed(2)}&cu=INR&tn=Order%20Payment`;

    // Generate QR code as base64 image
    const qrCodeImage = await QRCode.toDataURL(upiLink, {
      width: 250,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff"
      }
    });

    const newOrder = {
      items: user.cart,
      address: address,
      paymentMethod: "UPI",
      createdAt: new Date(),
    };

    await userModel.findByIdAndUpdate(req.user._id, {
      $push: { orders: newOrder },
      $set: { cart: [] },
    });

    res.render("upiSession", { 
      cartItems, 
      address, 
      qrCodeImage,  // Pass QR code to view
      totalAmount,
      upiId: UPI_ID
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "UPI session creation failed" });
  }
});

module.exports = router;