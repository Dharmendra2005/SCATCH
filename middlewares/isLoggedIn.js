const jwt = require('jsonwebtoken');

const userModel = require("../models/user-model");

const cookieParser = require('cookie-parser');

function isLoggedIn(req, res, next) {
  if (!req.cookies.token) {
    req.flash('error', "you need to login first"); //flash - on this route will show this msg and it will work on another route which did redirect
    return res.redirect("/");
  }
  
  try{
    let decoded = jwt.verify(req.cookies.token, "shhhhhhhhhhhhhhh"); //for checking coming token is valid or not if yes then store in user
    let user = userModel.findOne({email: decoded.email}).select("-password");
    req.user = user;
    next();
  } catch(err){
    req.flash("Error", "Something went wrong");
    res.redirect("/");
  }
};