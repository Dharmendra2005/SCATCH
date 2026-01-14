const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/generateToken");




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
        res.status(401).send("Your registeration is successfuly");
      });
    });
  } catch (err) {
    console.log(err.message);
  }
}

module.exports.loginUser = async function (req, res){
    let {email, password}  = req.body;

    let user = await userModel.findOne({email: email});
    console.log(user);
    if(!user) return res.status(403).send("Email or Password incorrect.");

    bcrypt.compare(password, user.password, (err, result) => {
        if(result){
            let token = generateToken(user);
            res.cookie("token", token);
            res.send("Yes! you're logged");
        }else{
            return res.status(403).send("Email or Password incorrect.");
        }
    } )
}