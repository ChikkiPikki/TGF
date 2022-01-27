var mongoose = require("mongoose");

var Errorg = mongoose.Schema({
	fromFeature: String,
	date: String,
	message: String
})

module.exports = mongoose.model("Errorgen", Errorg);