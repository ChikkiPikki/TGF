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
	date: String,
	hours: Number,
	task: String,
	tCode: Number,
	phone: Number,
	cv: {
		link: String
	},
	profilePic:{
		id:{
			type:mongoose.Schema.Types.ObjectId,
			ref:'Image'
		},
		link: String
	},
	events:[{
		id:{
			type:mongoose.Schema.Types.ObjectId,
			ref: 'Event'
		},
		name: String
	}]


});
Volunteer.plugin(passportLocalMongoose);

module.exports = mongoose.model('Volunteer', Volunteer);