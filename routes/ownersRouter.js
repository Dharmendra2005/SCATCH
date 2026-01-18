const express = require("express");
const ownerModel = require("../models/owners-model");
const productModel = require("../models/product-model");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const isOwnerLoggedIn = require("../middlewares/isOwnerLoggedIn");

// Delete all products
router.delete("/delete/all", async (req, res) => {
  try {
    await productModel.deleteMany({});
    console.log("All products deleted");
    res.json({ success: true, message: "All products deleted" });
  } catch (error) {
    console.error("Delete all products error:", error);
    res.status(500).json({ success: false, message: "Failed to delete products" });
  }
});

// Delete single product
router.delete("/delete/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;
    await productModel.findByIdAndDelete(productId);
    console.log("Product deleted:", productId);
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ success: false, message: "Failed to delete product" });
  }
});

module.exports = router;
