var mongoose = require("mongoose");
var Image = require("./ImageSchema.js");
var Volunteer = require("./Volunteer.js")
var Donation = require("./Donation.js")

var Event = new mongoose.Schema({
	name: String,
	date: Date,
	published: Boolean,
	content: {
		subtitle: String,
		paragraphs: [String],
		img: [{
			link: String,
			public_id: String,
			context: String
		}]
	},
	volunteers: [{
		id:{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Volunteer'
		},
		name: String,
		role: String,
		profilePic:{link:String}
	}],
	donations:[{
		id:{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Donation'
		},
		name: String,
		amount: Number,
		email: String
	}],
	tag: String
})

module.exports = mongoose.model('Event', Event);
