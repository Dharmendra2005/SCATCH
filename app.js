process.noDeprecation = true;

require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const flash = require("express-flash");
const session = require('express-session');
const db = require("./config/mongoose-connection");
const ownersRouter = require("./routes/ownersRouter");
const usersRouter = require("./routes/usersRouter");
const productsRouter = require("./routes/productsRouter");
const indexRouter = require("./routes/index");

const expressSession = require("express-session");

app.use(cookieParser());
app.use((req, res, next) => {
  res.locals.loggedin = !!req.cookies.token;
  res.locals.ownerLoggedIn = !!req.cookies.owner;
  next();
});
app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.JWT_KEY || "shhhhhhhhhhhhhh",
  }),
);
app.use(flash());
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/owners", ownersRouter);
app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use("/", indexRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
