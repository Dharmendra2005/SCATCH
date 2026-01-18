const express = require("express");
const ownerModel = require("../models/owners-model");
const productModel = require("../models/product-model");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const isOwnerLoggedIn = require("../middlewares/isOwnerLoggedIn");

if (process.env.NODE_ENV === "development") {
  router.post("/create", async (req, res) => {
    let owners = await ownerModel.find();
    if (owners.length > 0) {
      return res.status(504).send("you have not permission to create product");
    }
    let { fullname, email, password } = req.body;
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        let createdOwner = await ownerModel.create({
          fullname,
          email,
          password: hash,
        });
        let token = jwt.sign({ email }, process.env.JWT_KEY || "shhhhhhhhhhhhhh");
        res.cookie("token", token);
        res.status(201).send(createdOwner);
      });
    });
    // console.log(process.env.NODE_ENV) //to check node environment
  });
}

router.get("/admin", isOwnerLoggedIn, async (req, res) => {
  try {
    let success = req.flash("success");
    let products = await productModel.find().sort({ createdAt: -1 });
    res.render("createproducts", { success, products });
  } catch (error) {
    console.error("Admin panel error:", error);
    res.render("createproducts", { success: [], products: [] });
  }
});

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
