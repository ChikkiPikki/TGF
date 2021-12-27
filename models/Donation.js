var mongoose = require("mongoose");


var Donation = new mongoose.Schema({
	amount: Number,
	name: String,
	date: String,
	email: String,
	orderId: String,
	completed: Boolean,
	phone: Number
});

module.exports = mongoose.model("Donation", Donation);