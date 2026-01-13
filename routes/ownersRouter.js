const express = require("express");
const ownerModel = require("../models/owners-model");
const router = express.Router();

if (process.env.NODE_ENV === "development") {
  router.post("/create", async (req, res) => {
    let owners = await ownerModel.find();
    if (owners.length > 0){
      return res.status(504).send("you have not permission to creaet owner");
    }
   let { fullname, email, password } = req.body;

    let createdOwner = await ownerModel.create({
        fullname,
        email,
        password
    });
    res.status(201).send(createdOwner);
});
}

// router.delete("/delete/all", async (req, res) => {
//   await ownerModel.deleteMany({});
//   res.send("All owners deleted");
// });


router.get("/", (req, res) => {
  res.send("hello Dharm U r doing good job till now !");
});

// console.log(process.env.NODE_ENV) //to check node environment

module.exports = router;
