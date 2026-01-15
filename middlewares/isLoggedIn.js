const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");

const JWT_KEY = process.env.JWT_KEY || "shhhhhhhhhhhhhh";

async function isLoggedIn(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        req.flash("error", "You need to login first");
        return res.redirect("/");
    }

    try {
        const decoded = jwt.verify(token, JWT_KEY);
        const user = await userModel.findOne({ email: decoded.email }).select("-password");
        if (!user) {
            req.flash("error", "User not found");
            return res.redirect("/");
        }
        req.user = user;
        next();
    } catch (err) {
        console.error("Token verification error:", err);
        req.flash("error", "Session expired, please login again");
        res.clearCookie("token");
        return res.redirect("/");
    }
}

module.exports = isLoggedIn;
