const express = require("express");
const ownerModel = require("../models/owners-model");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

if (process.env.NODE_ENV === "development") {
  router.post("/create", async (req, res) => {
    let owners = await ownerModel.find();
    if (owners.length > 0) {
      return res.status(504).send("you have not permission to creaet owner");
    }
    let { fullname, email, password } = req.body;
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        let createdOwner = await ownerModel.create({
          fullname,
          email,
          password: hash,
        });
        let token = jwt.sign({ email }, "shhhhhhhhhhhhhh");
        res.cookie("token", token);
        res.status(201).send(createdOwner);
      });
    });
    // console.log(process.env.NODE_ENV) //to check node environment
  });
}
router.get("/", (req, res) => {
  res.send("hello Dharm U r doing good job till now !");
});
// router.delete("/delete/all", async (req, res) => {
//   await ownerModel.deleteMany({});
//   res.send("All owners deleted");
// });
module.exports = router;
