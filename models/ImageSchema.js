var mongoose = require('mongoose');
  
var imageSchema = new mongoose.Schema({
    link:String,
    context: String,
   	number: Number
});

  
module.exports = new mongoose.model('Image', imageSchema);