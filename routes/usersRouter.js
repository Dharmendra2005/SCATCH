const express = require("express");
const router = express.Router();
const userModel = require("../models/user-model");
const {
  registerUser,
  loginUser,
  logout,
} = require("../controllers/authController");

const isLoggedIn = require("../middlewares/isLoggedIn");
const addressModel = require("../models/address-model");
const contactMessageModel = require("../models/contact-message-model");
const { generateToken } = require("../utils/generateToken");
const mongoose = require("mongoose");

// router.get("/", (req, res) => {
//   res.send("hello Dharm U r doing good job till now !");
// });

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/logout", logout);

router.delete("/delete/:id", isLoggedIn, async (req, res) => {
  try {
    const userID = req.user._id;
    const productId = req.params.id;
    // console.log(productId);
    await userModel.updateOne(
      { _id: userID },
      { $pull: { cart: { product: productId } } },
    );
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    // console.error("Delete product error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete product" });
  }
});

router.get("/payment", isLoggedIn, async (req, res) => {
  const addressId = req.query.addressId;

  if (!addressId) {
    return res.status(400).send("Address ID required");
  }

  const user = await userModel.findById(req.user._id).populate("cart.product");
  const address = await addressModel.findById(addressId);

  if (!address) {
    return res.status(400).send("Address not found");
  }

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

  res.render("finallyPlaceOrder", { cartItems, address, addressId });
});

router.post("/cart/update", isLoggedIn, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    await userModel.updateOne(
      { _id: userId, "cart.product": productId },
      { $set: { "cart.$.quantity": quantity } },
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

router.get("/profile", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

router.get("/profile/addresses", isLoggedIn, async (req, res) => {
  try {
    const addresses = await addressModel
      .find({ user: req.user._id })
      .sort({ defaultAddress: -1, createdAt: -1 })
      .lean();

    res.json({ success: true, addresses });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to load saved addresses",
    });
  }
});

router.post("/contact", isLoggedIn, async (req, res) => {
  try {
    const email = (req.body.email || req.user.email || "").trim();
    const message = (req.body.message || "").trim();

    if (!email || !message) {
      return res.status(400).json({
        success: false,
        message: "Email and message are required",
      });
    }

    await contactMessageModel.create({
      user: req.user._id,
      email,
      message,
    });

    res.json({
      success: true,
      message: "Your message has been sent successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to send your message",
    });
  }
});

router.post("/profile/update", isLoggedIn, async (req, res) => {
  try {
    const fullname = (req.body.fullname || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const contact = (req.body.contact || "").trim();

    if (!fullname || !email || !contact) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and mobile number are required",
      });
    }

    const existingUser = await userModel.findOne({
      email,
      _id: { $ne: req.user._id },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This email is already in use",
      });
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(
        req.user._id,
        {
          $set: {
            fullname,
            email,
            contact,
          },
        },
        { new: true },
      )
      .select("-password");

    const token = generateToken(updatedUser);
    res.cookie("token", token);

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
});

router.get("/myorders", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await userModel.findById(userId);

    // Get orders and populate product details for each item
    const orders = user.orders || [];

    // Populate products and addresses for each order
    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        const address = await addressModel.findById(order.address);
        const populatedItems = await Promise.all(
          order.items.map(async (item) => {
            const productModel = require("../models/product-model");
            const product = await productModel.findById(
              item.product._id || item.product,
            );
            return {
              product: product,
              quantity: item.quantity,
            };
          }),
        );
        return {
          orderId: order.orderId,
          status: order.status,
          paymentMethod: order.paymentMethod,
          createdAt: order.createdAt,
          items: populatedItems,
          address: address,
        };
      }),
    );

    // Sort orders by date (most recent first)
    populatedOrders.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    res.render("myOrders", { orders: populatedOrders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Dev-only debug route to check DB connection details
router.get("/debug/db", async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(404).json({ success: false });
    }

    const uri = process.env.MONGODB_URI || null;
    const readyState = mongoose.connection.readyState; // 0 = disconnected, 1 = connected
    const dbName = mongoose.connection.name || null;

    res.json({ success: true, uri, readyState, dbName });
  } catch (err) {
    console.error("debug db error", err);
    res.status(500).json({ success: false, message: "debug failed" });
  }
});
module.exports = router;
