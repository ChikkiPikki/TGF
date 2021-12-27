var mongoose = require("mongoose");
var Image = require("./ImageSchema.js");
var Volunteer = require("./Volunteer.js")
var Donation = require("./Donation.js")

var Blog = new mongoose.Schema({
	name: String,
	date: String,
	content: [{
		para: String,
		img:[{
			id:{
				type:mongoose.Schema.Types.ObjectId,
			ref: 'Image'
			},
			data: Buffer,
			contentType: String
		}]
	}],
	volunteers: [{
		id:{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Volunteer'
		},
		name: String,
		role: String
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

module.exports = mongoose.model('Blog', Blog);
