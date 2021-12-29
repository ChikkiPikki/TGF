var mongoose = require("mongoose");
var Event = require("./Event.js");
var Image = require("./ImageSchema.js");


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
	events:[{
		id:{type:mongoose.Schema.Types.ObjectId,
		ref: 'Event'},
		name: String
	}]


})

module.exports = mongoose.model('Volunteer', Volunteer);