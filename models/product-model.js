const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    image: Buffer,
    name: String,
    price: Number,
    discount: {
      type: Number,
      default: 0,
    },
    bgcolor: String,
    panelcolor: String,
    textcolor: String,
    quantity: Number,
    sizes: {
      type: [String],
      default: ["S", "M", "L", "XL", "XXL"],
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.product || mongoose.model("product", productSchema);
