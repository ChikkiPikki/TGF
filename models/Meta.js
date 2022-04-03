var mongoose = require("mongoose");
var Meta = new mongoose.Schema({
	name: String,
	value: Number
})

module.exports = mongoose.model("Meta", Meta)