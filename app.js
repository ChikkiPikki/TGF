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
app.use("/", express.static("./views"));
// app.use("/css", express.static("./views/css"));
// app.use("/js", express.static("./views/js"));

// app.use("img", express.static("./views/img/home"));








app.get("/", (req, res)=>{
	res.render("index.ejs")
});
app.get("img/:img", (req, res)=>{
	res.send("./views/img/"+req.params.img)
});


app.listen(3000, ()=>{
	console.log("process begun");
});
