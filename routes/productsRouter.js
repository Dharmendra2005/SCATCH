const express = require("express");
const multer = require("multer");
const upload = require("../config/multer-config");
const productModel = require("../models/product-model");
const isOwnerLoggedIn = require("../middlewares/isOwnerLoggedIn");
const checkDuplicateImage = require("../middlewares/checkDuplicateImage");

const router = express.Router();



router.get("/items", async (req, res) => {
  let products = await productModel.find().sort({ createdAt: 1 });
  let error = req.flash("error");
  let success = req.flash("success");
  //have to send sucess msg
  res.render("createproducts", { error, success, products });
});

router.post("/made", upload.single("image"), checkDuplicateImage,  async (req, res) => {
  try {
    let { name, price, discount, bgcolor, panelcolor, textcolor, quantity} = req.body;
    let image = req.file;

    let item = await productModel.create({
      name,
      price,
      discount,
      bgcolor,
      panelcolor,
      textcolor,
      image: image ? image.buffer : null,
      quantity,
    });
    //how can we show that product on top
    req.flash("success", "Product created successfully!");
    res.redirect("/products/items");
  } catch (err) {
    console.error(err);
    res.send("Something went wrong while creating product");
  }
});

module.exports = router;
