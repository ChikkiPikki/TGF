var mongoose = require("mongoose");

var Volunteer = new mongoose.Schema({
	name: String,
	description: String,
	email: String,
	role: String,
	approved: Boolean,
	date: String,
	hours: Number,
	task: String,
	tCode: Number,
	phone: Number,
	cv: {
		data: Buffer,
		contentType: String
	}


})

module.exports = mongoose.model('Volunteer', Volunteer);