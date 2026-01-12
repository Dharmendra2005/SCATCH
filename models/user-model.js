const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    fullname: {
        type: String,
        minLength: 3,
        trim: true
    },
    username: String,
    email: String,
    password: String,
    cart : {
        type: Array,
        default: []
    },
    isadmin:Boolean,
    Orders:{
        type: Array,
        default : []
    },
    contact: Number,
    picture: String,

});

module.exports = mongoose.model('user', userSchema);