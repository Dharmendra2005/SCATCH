const express = require("express");
const router = express.Router();
const userModel = require("../models/user-model");
const {
  registerUser,
  loginUser,
  logout,
} = require("../controllers/authController");

const isLoggedIn = require("../middlewares/isLoggedIn");

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

module.exports = router;
