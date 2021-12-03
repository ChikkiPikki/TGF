

var mongoose = require("mongoose");

var Query = new mongoose.Schema({
	name: String,
	date: Date,
	email: String,
	location: String,
	query: String
});

module.exports = mongoose.model("Query", Query);