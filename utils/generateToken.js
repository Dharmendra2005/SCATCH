const jwt = require("jsonwebtoken");

const JWT_KEY = process.env.JWT_KEY || "shhhhhhhhhhhhhh";

const generateToken = (user) => {
    return jwt.sign({email: user.email, id: user._id}, JWT_KEY, { expiresIn: "1h" });
}

module.exports.generateToken = generateToken;
