var mongoose = require("mongoose");


var Blog = new mongoose.Schema({
	name: String,
	date: String,
	content: [{
		para: String,
		img:[{
			id:mongoose.Schema.Types.ObjectId,
			ref: 'Image'
		}]
	}],
	volunteers: [{
		id: mongoose.Schema.Types.ObjectId,
		ref: 'volunteer'
	}]
})

module.exports = mongoose.model('Blog', Blog);
