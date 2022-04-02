var mongoose = require('mongoose');
  
var ImageSchema = new mongoose.Schema({
    link:String,
    context: String,
   	number: Number,
   	home: Boolean,
   	public_id: String
});

  
module.exports = new mongoose.model('Image', ImageSchema);