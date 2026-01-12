const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost/Scatch")
.then(function(){
    console.log("Connected");
})
.catch(function(err){
    console.log(err);
})

module.exports = mongoose.connection;