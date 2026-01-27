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
  const user = await userModel.findById(req.user._id).populate("cart.product");

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

  res.render("finallyPlaceOrder", { cartItems });
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

router.get("/myorders", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;
    const addresses = await addressModel.find({ user: userId });
    res.send("My address are there");
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});
module.exports = router;
