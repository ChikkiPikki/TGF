var mongoose = require("mongoose");
var Blog = require("./Blog.js");
var Volunteer = new mongoose.Schema({
	name: String,
	description: String,
	email: String,
	role: String,
	approved: String,
	date: String,
	hours: Number,
	task: String,
	tCode: Number,
	phone: Number,
	cv: {
		data: Buffer,
		contentType: String
	},
	profilePic:{
		data: Buffer,
		contentType: String
	},
	blogs:[{
		id:mongoose.Schema.Types.ObjectId,
		ref: 'Blog'
	}]


})

module.exports = mongoose.model('Volunteer', Volunteer);