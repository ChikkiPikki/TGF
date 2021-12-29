var mongoose = require("mongoose");


var Donation = new mongoose.Schema({
	amount: Number,
	name: String,
	date: String,
	email: String,
	orderId: String,
	completed: Boolean,
	phone: Number,
	utilised: Boolean
});

module.exports = mongoose.model("Donation", Donation);