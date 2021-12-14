var express = require("express");
var mongoose = require("mongoose");
var mongodb = require("mongodb");
var bodyParser = require("body-parser");
var path = require("path");
var dotenv = require("dotenv");
var multer = require('multer');
var fs = require("fs")



dotenv.config("./.env", (err)=>{
	if(err){console.log(err)}
});
const ejsLint = require('ejs-lint');

var app = express();

app.use(
	bodyParser.urlencoded({
		extended:false
	}));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, '/views/dynamic'));
app.use("/", express.static("./views"));

mongoose.connect(process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, (err)=>{
			if (err){console.log(err)}})

//Importing mongodb and mongoose schemas from models folder
var Query = require("./models/Query.js");
var Admin = require("./models/Admin.js");
var Image = require("./models/ImageSchema.js");


var multer = require('multer');
  
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
    cb(null, 'src/');
    },
    filename: function(req, file, cb) {
     cb(null, new Date().toISOString().replace(/:/g, '-')+ file.originalname);
      }
  });
  
var upload = multer({ storage: storage });








app.get("/", (req, res)=>{
	Query.create({
		name:"Tanay",
		email: "tststs@tststs.com"
	}, (err)=>{
		if(err){console.log(err)};

		console.log("hi");

	});
	// Query.save()

	res.render("home.ejs")
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

app.get("/about", (req, res)=>{
	res.render("about.ejs");
});

app.get("/contact", (req, res)=>{
	res.render("contact.ejs");
});

app.get("/admin", (req, res)=>{
	Image.find({}, (err, items)=>{
		if(err){console.log(err)}
		else{
			res.render("admin.ejs", {items: items});
		}
	})

	
});

app.post('/test', upload.single('image'), (req, res, next) => {
  
    var obj = {
        name: req.body.name,
        desc: req.body.desc,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/src/' + req.file.filename)), //Change this to an appropriate
            //image file identifier synatx
            contentType: 'image/png'
        }
    }
    Image.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            item.save();
            res.redirect('/admin');
        }
    });
});



app.listen(process.env.PORT, process.env.IP, ()=>{
	console.log("process begun");
});
