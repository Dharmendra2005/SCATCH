const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    trim: true,
  },
  username: String,
  email: String,
  password: String,
  cart: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1,
      },
      size: {
        type: String,
        default: "M",
      },
    },
  ],
  orders: {
    type: Array,
    default: [],
  },
  contact: String,
  picture: String,
  Address: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "address",
    },
  ],
});

module.exports = mongoose.models.user || mongoose.model("user", userSchema);
