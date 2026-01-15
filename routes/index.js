const express = require("express");

const router = express.Router();

const isLoggedIn = require("../middlewares/isLoggedIn");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");

router.get("/", function (req, res) {
  let error = req.flash("error");
  res.render("index", {
    error: error,
    loggedin: req.cookies.token ? true : false
  });
});

router.get("/shop", isLoggedIn, async (req, res) => {
  try {
    let products = await productModel.find();
    const { sortby, category, discount, available } = req.query;
    
    // Apply sorting
    if (sortby) {
      switch(sortby) {
        case 'newest':
          products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'price-low':
          products.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          products.sort((a, b) => b.price - a.price);
          break;
        default:
          // Popular - keep original order
          break;
      }
    }
    
    // Apply filtering
    if (discount === 'true') {
      products = products.filter(product => product.discount > 0);
    }
    
    console.log("Products found:", products.length);
    console.log("Filters applied:", { sortby, category, discount, available });
    res.render("shop", { products, loggedin: true });
  } catch (error) {
    console.error("Shop error:", error);
    res.render("shop", { products: [], loggedin: true });
  }
});

router.get("/cart", isLoggedIn, async (req, res) => {
  try {
    console.log("Loading cart for user:", req.user._id);
    const user = await userModel.findById(req.user._id).populate('cart');
    console.log("User cart items:", user.cart);
    const cartItems = user.cart || [];
    res.render("cart", { cartItems, loggedin: true });
  } catch (error) {
    console.error("Cart error:", error);
    req.flash("error", "Failed to load cart");
    res.redirect("/shop");
  }
});

router.post("/addtocart/:productId", isLoggedIn, async (req, res) => {
  try {
    const productId = req.params.productId;
    const userId = req.user._id;
    
    console.log("Adding to cart - Product ID:", productId, "User ID:", userId);
    
    // Check if product exists
    const product = await productModel.findById(productId);
    if (!product) {
      console.log("Product not found:", productId);
      req.flash("error", "Product not found");
      return res.redirect("/shop");
    }
    
    // Check if product already in cart
    const user = await userModel.findById(userId);
    if (user.cart.includes(productId)) {
      console.log("Product already in cart");
      req.flash("error", "Product already in cart");
      return res.redirect("/shop");
    }
    
    // Add product to user's cart
    await userModel.findByIdAndUpdate(userId, {
      $push: { cart: productId }
    });
    
    console.log("Cart updated successfully");
    req.flash("success", "Product added to cart");
    res.redirect("/shop");
  } catch (error) {
    console.error("Add to cart error:", error);
    req.flash("error", "Failed to add product to cart");
    res.redirect("/shop");
  }
});

router.post("/checkout", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).populate('cart');
    
    // Create order
    const order = {
      items: user.cart,
      total: user.cart.reduce((total, item) => total + item.price, 0) + 20,
      date: new Date()
    };
    
    // Add to user's orders and clear cart
    await userModel.findByIdAndUpdate(req.user._id, {
      $push: { orders: order },
      $set: { cart: [] }
    });
    
    req.flash("success", "Order placed successfully!");
    res.redirect("/shop");
  } catch (error) {
    req.flash("error", "Failed to place order");
    res.redirect("/cart");
  }
});

router.get("/logout", (req, res)=> {
  console.log("User logging out");
  res.clearCookie("token");
  res.redirect("/");
})

module.exports = router;
