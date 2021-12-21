var mongoose = require("mongoose");

var Blog = new mongoose.Schema({
	name: String,
	text: String,
	desc: String,
	img: [{
		data: Buffer,
		contentType: String
	}]
})

module.exports = mongoose.model('Blog', Blog);
