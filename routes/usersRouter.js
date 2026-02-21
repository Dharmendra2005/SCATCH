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
module.exports = router;
