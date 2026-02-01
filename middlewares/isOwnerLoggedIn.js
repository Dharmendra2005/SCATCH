const jwt = require("jsonwebtoken");
const ownerModel = require("../models/owners-model");

const JWT_KEY = process.env.JWT_KEY || "shhhhhhhhhhhhhh";

async function isOwnerLoggedIn(req, res, next) {
  const token = req.cookies.owner;

  // No owner cookie → block
  if (!token) {
    req.flash("error", "Please log in as owner");
    return res.redirect("/owners/create");
  }

  try {
    const decoded = jwt.verify(token, JWT_KEY);
    const owner = await ownerModel.findOne({ email: decoded.email });

    if (!owner) {
      req.flash("error", "Owner not found");
      return res.redirect("/owners/create");
    }

    req.owner = owner;
    req.ownerId = owner._id;
    next(); // ✅ allow access
  } catch (err) {
    console.error("Owner token verification error:", err);
    req.flash("error", "Invalid or expired token");
    res.clearCookie("owner");
    return res.redirect("/owners/create");
  }
}

module.exports = isOwnerLoggedIn;
