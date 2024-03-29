var mongoose = require("mongoose");
var Event = require("./Event.js");
var Image = require("./ImageSchema.js");
const passportLocalMongoose = require('passport-local-mongoose');

var Volunteer = new mongoose.Schema({
	name: String,
	username: String,
	password: String,
	description: String,
	email: String,
	role: String,
	approved: String,
	date: Date,
	hours: Number,
	task: String,
	tCode: Number,
	phone: Number,
	cv: String,
	cv_public_id: String,
	profilePic: {
		link: String,
		public_id: String,
		context: String
	},
	events:[{
		id:{
			type:mongoose.Schema.Types.ObjectId,
			ref: 'Event'
		},
		name: String,
		date: String,
		tag: String
	}]
});
// Volunteer.plugin(passportLocalMongoose);

module.exports = mongoose.model('Volunteer', Volunteer);