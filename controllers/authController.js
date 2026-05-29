const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/generateToken");

const productModel = require("../models/product-model");

module.exports.registerUser = async function (req, res) {
  try {
    let { fullname, email, password } = req.body;
    let user = await userModel.findOne({ email });
    if (user)
      return res
        .status(401)
        .send("you already have an account please do login.");
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        let user = await userModel.create({
          fullname,
          email,
          password: hash,
        });
        let token = generateToken(user);

        // Determine if client expects JSON (API / Postman) or a browser redirect
        const wantsJson =
          req.xhr ||
          (req.get("Accept") || "").includes("application/json") ||
          (req.get("Content-Type") || "").includes("application/json") ||
          req.query.api === "true";

        if (wantsJson) {
          return res.status(201).json({
            success: true,
            message: "Registration successful",
            user: {
              _id: user._id,
              fullname: user.fullname,
              email: user.email,
            },
            token,
          });
        }

        // Default behaviour for browser flows: set cookie and redirect
        res.cookie("token", token);
        req.flash("success", "Registration successful! Welcome to Scatch");
        return res.redirect("/shop");
      });
    });
  } catch (err) {
    console.log(err.message);
  }
};

module.exports.loginUser = async function (req, res) {
  let { email, password } = req.body;

  let user = await userModel.findOne({ email: email });
  if (!user) {
    req.flash("error", "Email or Password incorrect.");
    return res.redirect("/");
  }

  bcrypt.compare(password, user.password, async (err, result) => {
    if (result) {
      let token = generateToken(user);
      res.cookie("token", token);
      req.flash("success", `Welcome🙏 ${user.fullname}`);
      return res.redirect("/shop");
    } else {
      req.flash("error", "Email or Password incorrect.");
      return res.redirect("/");
    }
  });
};

module.exports.logout = function (req, res) {
  res.clearCookie("token");
  res.clearCookie("owner");
  req.flash("success", "Logged out successfully");
  res.redirect("/");
};
