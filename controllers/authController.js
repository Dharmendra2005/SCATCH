const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/generateToken");




const productModel = require("../models/product-model");

module.exports.registerUser = async function (req, res){
  try {
    let { fullname, email, password } = req.body;
    let user =  await userModel.findOne({email});
    if(user) return res.status(401).send("you already have an account please do login.")
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        let user = await userModel.create({
          fullname,
          email,
          password: hash,
        });
        let token = generateToken(user);
        res.cookie("token", token);
        req.flash("success", "Your registration is successfuly");
        return res.redirect("/");
      });
    });
  } catch (err) {
    console.log(err.message);
  }
}

module.exports.loginUser = async function (req, res){
    let {email, password}  = req.body;

    let user = await userModel.findOne({email: email});
    if(!user) {
       req.flash("error", "Email or Password incorrect.");
       return res.redirect("/");
    }

    bcrypt.compare(password, user.password, async (err, result) => {
        if(result){
            let token = generateToken(user);
            res.cookie("token", token);
            let products = await productModel.find();
            res.render("shop", { products });
        }else{
             req.flash("error", "Email or Password incorrect.");
             return res.redirect("/");
        }
    })
}

module.exports.logout = function (req, res) {
  res.clearCookie("token", { httpOnly: true }); // ensures cookie is removed
  res.redirect("/"); // redirect to home page
};