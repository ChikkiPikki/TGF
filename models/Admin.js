var mongoose = require("mongoose");

var Admin = new mongoose.Schema({
	name: String,
	lastSignIn: Date,
	password: String,
	controls: []
});

module.exports = mongoose.model("Admin", Admin);
