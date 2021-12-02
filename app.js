var express = require("express");
var mongoose = require("mongoose");
var mongodb = require("mongodb");
var bodyParser = require("body-parser");

var app = express();

app.use(
	bodyParser.urlencoded({
		extended:true
	}));
app.set("view engine", "ejs");



app.get("/", (req, res)=>{
	res.render("home", {
		name: "TecSo Global Foundation"
	});
});

app.listen(3000, ()=>{
	console.log("process begun");
});
