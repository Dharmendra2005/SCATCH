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
    await userModel.updateOne({_id : userID}, {$pull:{cart:productId}});
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    // console.error("Delete product error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete product" });
  }
});


router.get("/payment", isLoggedIn, async (req, res) => {
  const user = await userModel.findById(req.user._id).populate('cart')
  res.render("finallyPlaceOrder", {cartItems: user.cart});
})

router.post("/cart/update", isLoggedIn, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    await userModel.updateOne(
      { _id: userId, "cart._id": productId },
      { $set: { "cart.$.quantity": quantity } }
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

module.exports = router;
