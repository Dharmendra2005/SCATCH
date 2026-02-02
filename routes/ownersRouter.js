const express = require("express");
const mongoose = require("mongoose");
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

    // Get only users who have placed at least one order (excluding hidden ones)
    const usersWithOrders = await userModel
      .find({
        orders: { $exists: true, $not: { $size: 0 } },
      })
      .populate("Address")
      .populate({
        path: "orders.items.product",
        model: "product",
      })
      .populate({
        path: "orders.address",
        model: "address",
      })
      .sort({ "orders.createdAt": -1 });

    // Filter out hidden orders and users with no visible orders
    const usersData = usersWithOrders
      .map((user) => {
        const visibleOrders = user.orders.filter(
          (order) => !order.hiddenFromDashboard,
        );

        console.log(`User ${user.email}: Total orders: ${user.orders.length}, Visible orders: ${visibleOrders.length}`); // Debug log

        if (visibleOrders.length === 0) return null; // Skip users with no visible orders

        const lastOrder = visibleOrders[visibleOrders.length - 1];

        return {
          ...user.toObject(),
          orders: visibleOrders, // Only show non-hidden orders
          lastOrderDate: lastOrder ? lastOrder.createdAt : null,
          totalOrders: visibleOrders.length,
        };
      })
      .filter((user) => user !== null); // Remove users with no visible orders

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

router.delete(
  "/deleteOrder/:userId/:orderID",
  isOwnerLoggedIn,
  async (req, res) => {
    try {
      const userId = req.params.userId;
      const orderTimestamp = parseInt(req.params.orderID);

      // console.log("Hiding order:", { userId, orderTimestamp }); 

      // Mark order as hidden from dashboard instead of deleting
      const result = await userModel.updateOne(
        {
          _id: userId,
          "orders.createdAt": new Date(orderTimestamp),
        },
        { $set: { "orders.$.hiddenFromDashboard": true } },
      );

      // console.log("Update result:", result); // Debug log

      if (result.matchedCount === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }

      res.json({ success: true, message: "Order hidden from dashboard" });
    } catch (error) {
      console.error("Hide order error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to hide order: " + error.message,
      });
    }
  },
);

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
