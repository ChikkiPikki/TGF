var express = require("express");
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var dotenv = require("dotenv");

var app = express();

app.use(
	bodyParser.urlencoded({
		extended:true
	}));
app.use(cookieParser);
app.set("view engine", "ejs");
dotenv.config();


app.get("/", (req, res)=>{
	res.render("home")
});

app.listen(process.env.PORT, ()=>{
	console.log("process begun")
});

