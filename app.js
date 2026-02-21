require("dotenv").config();
process.noDeprecation = true;
const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const flash = require("express-flash");
const compression = require("compression");
const db = require("./config/mongoose-connection");
const ownersRouter = require("./routes/ownersRouter");
const usersRouter = require("./routes/usersRouter");
const productsRouter = require("./routes/productsRouter");
const addressRouter = require("./routes/addressRouter");
const CODRouter = require("./routes/CODRouter");
const stripeRouter = require("./routes/stripeRouter");
const indexRouter = require("./routes/index");
const jwt = require("jsonwebtoken");
const userModel = require("./models/user-model");
const upiRouter = require("./routes/upiRouter");

const expressSession = require("express-session");

// Enable compression for better performance
app.use(compression());

app.use(cookieParser());

// Session and flash must come BEFORE auth middleware
app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.JWT_KEY,
  }),
);
app.use(flash());

// Cache user data to avoid repeated database calls
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

app.use(async (req, res, next) => {
  res.locals.loggedin = false;
  res.locals.ownerLoggedIn = false;
  res.locals.user = null;

  // Check user token
  if (req.cookies.token) {
    try {
      const decoded = jwt.verify(
        req.cookies.token,
        process.env.JWT_KEY || "shhhhhhhhhhhhhh",
      );

      // Check cache first
      const cacheKey = `user_${decoded.email}`;
      const cachedUser = userCache.get(cacheKey);

      if (cachedUser && Date.now() - cachedUser.timestamp < CACHE_TTL) {
        res.locals.user = cachedUser.data;
        res.locals.loggedin = true;
      } else {
        const user = await userModel
          .findOne({ email: decoded.email })
          .select("-password")
          .lean(); // Use lean() for better performance

        if (user) {
          // Cache the user data
          userCache.set(cacheKey, {
            data: user,
            timestamp: Date.now(),
          });
          res.locals.user = user;
          res.locals.loggedin = true;
        } else {
          // User not found, clear invalid token
          res.clearCookie("token");
        }
      }
    } catch (err) {
      // Token invalid, clear it
      res.clearCookie("token");
    }
  }

  // Check owner token
  if (req.cookies.owner) {
    try {
      const decoded = jwt.verify(
        req.cookies.owner,
        process.env.JWT_KEY || "shhhhhhhhhhhhhh",
      );

      // Validate owner exists (optional - you can add owner lookup here)
      res.locals.ownerLoggedIn = true;
    } catch (err) {
      // Owner token invalid, clear it
      res.clearCookie("owner");
    }
  }

  next();
});

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: "1d", // Cache static files for 1 day
    etag: true,
  }),
);

app.use("/owners", ownersRouter);
app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use("/address", addressRouter);
app.use("/COD", CODRouter);
app.use("/stripe", stripeRouter);
app.use("/upi", upiRouter);
app.use("/", indexRouter);

app.listen(3000, () => {
  console.log("Server is running on  http://localhost:3000/");
});
