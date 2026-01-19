const express = require("express");

const router = express.Router();
const bcrypt = require('bcrypt');
const isLoggedIn = require("../middlewares/isLoggedIn");
const isOwnerLoggedIn = require("../middlewares/isOwnerLoggedIn");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");
const ownerModel = require("../models/owners-model");

const { generateToken } = require("../utils/generateToken");

//POST → flash → redirect → GET → render → show flash

router.get("/", function (req, res) {
  let error = req.flash("error");
  let success = req.flash("success"); // Retrieve the success message
  res.render("index", {
    error: error,
    success: success, // Pass it to the template
    loggedin: req.cookies.token ? true : false,
  });
});

router.get("/shop", isLoggedIn, async (req, res) => {
  try {
    let products = await productModel.find();
    const { sortby, category, discount, available } = req.query;

    // Apply sorting
    if (sortby) {
      switch (sortby) {
        case "newest":
          products.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          );
          break;
        case "price-low":
          products.sort((a, b) => a.price - b.price);
          break;
        case "price-high":
          products.sort((a, b) => b.price - a.price);
          break;
        default:
          // Popular - keep original order
          break;
      }
    }

    // Apply filtering
    if (discount === "true") {
      products = products.filter((product) => product.discount > 0);
    }

    let error = req.flash("error");
    let success = req.flash("success");
    console.log("Products found:", products.length);
    console.log("Filters applied:", { sortby, category, discount, available });
    res.render("shop", { products, loggedin: true, error, success });
  } catch (error) {
    console.error("Shop error:", error);
    res.render("shop", { products: [], loggedin: true });
  }
});

router.get("/cart", isLoggedIn, async (req, res) => {
  try {
    console.log("Loading cart for user:", req.user._id);
    const user = await userModel.findById(req.user._id).populate("cart");
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

    // console.log("Adding to cart - Product ID:", productId, "User ID:", userId);

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
      // console.log("Product already in cart");
      req.flash("error", "Product already in cart");
      return res.redirect("/shop");
    }

    // Add product to user's cart
    await userModel.findByIdAndUpdate(userId, {
      $push: { cart: productId },
    });

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
    const user = await userModel.findById(req.user._id).populate("cart");

    // Create order
    const order = {
      items: user.cart,
      total: user.cart.reduce((total, item) => total + item.price, 0) + 20,
      date: new Date(),
    };

    // Add to user's orders and clear cart
    await userModel.findByIdAndUpdate(req.user._id, {
      $push: { orders: order },
      $set: { cart: [] },
    });

    req.flash("success", "Order placed successfully!");
    res.redirect("/shop");
  } catch (error) {
    req.flash("error", "Failed to place order");
    res.redirect("/cart");
  }
});

//Admin Access
router.get("/create", (req, res) => {
  res.render("owner-login");
});


// Create Owner ONLY via Postman 
// router.post("/create", async (req, res) => {
//   try {
//     const { username, email, password } = req.body;

//     // check if owner already exists
//     const existingOwner = await ownersModel.findOne({ email });
//     if (existingOwner) {
//       return res.status(400).json({
//         success: false,
//         message: "Owner already exists",
//       });
//     }

//     const salt = await bcrypt.genSalt(12);
//     const hash = await bcrypt.hash(password, salt);

//     const owner = await ownersModel.create({
//       username,
//       email,
//       password: hash,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Owner created successfully",
//       ownerId: owner._id,
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false });
//   }
// });

// Owner Login (UI)
router.post("/create", async (req, res) => {
  try {
    const { email, password } = req.body;

    const owner = await ownerModel.findOne({ email });
    if (!owner) {
      return res.send("Owner not found");
    }

    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) {
      return res.send("Wrong password");
    }

    const token = generateToken(owner);
    res.cookie("owner", token);

    res.render("createproducts", {
      products: owner.products || [],
      success: "Welcome, " + owner.username,
    });

  } catch (err) {
    console.error(err);
    res.send("Something went wrong");
    
  }
});


router.get("/logout", (req, res) => {
  console.log("User logging out");
  res.clearCookie("token");
  res.redirect("/");
});

module.exports = router;
