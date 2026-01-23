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
  Address: [{
    type:mongoose.Schema.Types.ObjectId,
    ref: 'address'
  }]
});

module.exports = mongoose.models.user || mongoose.model("user", userSchema);