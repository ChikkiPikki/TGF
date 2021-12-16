var mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');

var Admin = new mongoose.Schema({
	name: String,
	password: String
});

Admin.plugin(passportLocalMongoose);

module.exports = mongoose.model("Admin", Admin);
