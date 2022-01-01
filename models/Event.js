var mongoose = require("mongoose");
var Image = require("./ImageSchema.js");
var Volunteer = require("./Volunteer.js")
var Donation = require("./Donation.js")

var Event = new mongoose.Schema({
	name: String,
	date: String,
	published: Boolean,
	content: {
		paragraphs: [
			String
		],
		img:[{
			data: Buffer,
			contentType: String
			//add context 
		}]
	},
	volunteers: [{
		id:{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Volunteer'
		},
		name: String,
		role: String,
		profilePic:{
			data: Buffer,
			contentType: String
		}
	}],
	donations:[{
		id:{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Donation'
		},
		name: String,
		amount: Number,
		email: String
	}]
})

module.exports = mongoose.model('Event', Event);
