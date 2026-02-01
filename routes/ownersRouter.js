const express = require("express");
const ownerModel = require("../models/owners-model");
const productModel = require("../models/product-model");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const isOwnerLoggedIn = require("../middlewares/isOwnerLoggedIn");
const userModel = require("../models/user-model");

// Delete all products
router.delete("/delete/all", async (req, res) => {
  try {
    await productModel.deleteMany({});
    // console.log("All products deleted");
    res.json({ success: true, message: "All products deleted" });
  } catch (error) {
    console.error("Delete all products error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete products" });
  }
});

// Delete single product
router.delete("/delete/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;
    await productModel.findByIdAndDelete(productId);
    // console.log("Product deleted:", productId);
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete product" });
  }
});

//to see owner dashboard
router.get("/ownerdashboard", isOwnerLoggedIn, async (req, res) => {
  try {
    const ownerId = req.ownerId;
    const owner = await ownerModel.findById(ownerId);

    // Get users who have placed orders, sorted by last order date
    const usersWithOrders = await userModel
      .find({
        orders: { $exists: true, $not: { $size: 0 } },
      })
      .populate("Address")
      .sort({ "orders.date": -1 });

    // Add last order date for each user for better sorting
    const usersData = usersWithOrders.map((user) => {
      const lastOrder =
        user.orders && user.orders.length > 0
          ? user.orders[user.orders.length - 1]
          : null;

      return {
        ...user.toObject(),
        lastOrderDate: lastOrder ? lastOrder.date : null,
        totalOrders: user.orders ? user.orders.length : 0,
      };
    });

    // Sort by last order date (most recent first)
    usersData.sort((a, b) => {
      if (!a.lastOrderDate) return 1;
      if (!b.lastOrderDate) return -1;
      return new Date(b.lastOrderDate) - new Date(a.lastOrderDate);
    });

    res.render("ownerdashboard", { owner, users: usersData });
  } catch (error) {
    console.error("Owner dashboard error:", error);
    res.status(500).send("Failed to load owner dashboard");
  }
});

// View individual user orders
router.get("/user/:userId", isOwnerLoggedIn, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await userModel.findById(userId).populate("Address");

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.render("userOrderDetails", { user });
  } catch (error) {
    console.error("User details error:", error);
    res.status(500).send("Failed to load user details");
  }
});

module.exports = router;
