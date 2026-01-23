const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
    name: String,
    Mobile_no : Number,
    PinCode: Number,
    House_no: String,
    Address: String,
    addressType: {
    type: String,
    enum: ["home", "office"]
  },
  defaultAddress: Boolean
});

module.exports = mongoose.model.address || mongoose.model("address", addressSchema);