const productModel = require("../models/product-model");


async function checkDuplicateImage(req, res, next) {
    let image = req.file;

    const products = await productModel.find();
//      // compare buffer of uploaded image with existing images
  for (let p of products) {
    if (p.image && p.image.equals(image.buffer)) { // Buffer.equals compares buffers
      return res.redirect("/products/items");
    }
  }
    next();

//why i didnot use bcrypt.compare()
// bcrypt.compare() is designed for hashing passwords, not arbitrary binary data.
// It’s slow by design (CPU-intensive) and adds a ton of unnecessary overhead.

}

module.exports = checkDuplicateImage;