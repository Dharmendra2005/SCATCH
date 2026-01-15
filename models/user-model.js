const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    trim: true,
  },
  username: String,
  email: String,
  password: String,
  cart: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product'
  }],
  orders: {
    type: Array,
    default: [],
  },
  contact: Number,
  picture: String,
});

module.exports = mongoose.models.user || mongoose.model("user", userSchema);