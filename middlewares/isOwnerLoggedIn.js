const jwt = require("jsonwebtoken");


module.exports = function isOwnerLoggedIn(req, res, next) {
  const token = req.cookies.owner;

  // ❌ No owner cookie → block
  if (!token) {
    return res.status(401).send("Access denied: Owner login required");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.owner = decoded;
    next(); // ✅ allow access
  } catch (err) {
    return res.status(401).send("Invalid or expired token");
  }
};