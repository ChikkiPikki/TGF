var express = require("express");
var mongoose = require("mongoose");
var mongodb = require("mongodb");
var bodyParser = require("body-parser");
var ENV = require("./env.js") //Comment out before deploying to devsev

var app = express();

app.use(
	bodyParser.urlencoded({
		extended:true
	}));
app.set("view engine", "ejs");
app.use("/", express.static("./views"));
mongoose.connect(process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, (err)=>{
			if (err){console.log(err)}})
// app.use("/css", express.static("./views/css"));
// app.use("/js", express.static("./views/js"));

// app.use("img", express.static("./views/img/home"));
var Query = require("./models/Query.js");










app.get("/", (req, res)=>{
	Query.create({
		name:"Tanay",
		email: "tststs@tststs.com"
	}, (err)=>{
		if(err){console.log(err)};

		console.log("hi");

	});
	// Query.save()

	res.render("index.ejs")
});
app.get("img/:img", (req, res)=>{
	res.send("./views/img/"+req.params.img)
});

app.post("/query", (req, res)=>{
	Query.create({
		name: req.body.name,
		email: req.body.email,
		location: req.body.city,
		date: new Date(),
		query: req.body.query
	}, (err)=>{
		if(err){
			console.log(err);
		}
	});
	Query.save();
});


app.listen(process.env.PORT || ENV.PORT, ()=>{
	console.log("process begun");
});
