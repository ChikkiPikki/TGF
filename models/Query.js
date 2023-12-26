

var mongoose = require("mongoose");

var Query = new mongoose.Schema({
	name: String,
	date: Date,
	title: String,
	email: String,
	message: String
});

module.exports = mongoose.model("Query", Query);