var mongoose = require("mongoose");
var Image = require("./ImageSchema.js");
var Volunteer = require("./Volunteer.js")

var Blog = new mongoose.Schema({
	name: String,
	date: String,
	content: [{
		para: String,
		img:[{
			type:mongoose.Schema.Types.ObjectId,
			ref: 'Image'
		}]
	}],
	volunteers: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Volunteer'
	}]
})

module.exports = mongoose.model('Blog', Blog);
