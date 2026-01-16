const express = require("express");
const upload = require("../config/multer-config");
const productModel = require("../models/product-model");

const router = express.Router();

// Test route to create sample products
// router.get("/create-sample", async (req, res) => {
//   try {
//     // Create a sample product without image for testing
//     const sampleProduct = await productModel.create({
//       name: "Sample Product",
//       price: 999,
//       discount: 10,
//       bgcolor: "#f3f4f6",
//       panelcolor: "#e5e7eb",
//       textcolor: "#111827",
//       image: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", 'base64')
//     });
    
//     console.log("Sample product created:", sampleProduct);
//     res.redirect("/shop");
//   } catch (error) {
//     console.error("Error creating sample product:", error);
//     res.send("Error creating sample product");
//   }
// });

router.post("/create", upload.single("image"), (req, res) => {
  try {
    let { image, name, price, discount, bgcolor, panelcolor, textcolor } =
      req.body;
    let product = productModel.create({
      image: req.file.buffer,
      name,
      price,
      discount,
      bgcolor,
      panelcolor,
      textcolor,
    });
    req.flash("success", "Product created successfully");
    res.redirect("/owners/admin");
  } catch (err) {
    res.send(err.message);
  }
});

module.exports = router;
