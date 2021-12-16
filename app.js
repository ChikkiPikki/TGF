var express = require("express");
var mongoose = require("mongoose");
var mongodb = require("mongodb");
var bodyParser = require("body-parser");
var path = require("path");
var dotenv = require("dotenv");
var multer = require('multer');
var fs = require("fs");
var nodemailer = require("nodemailer");
const {google} = require("googleapis")

dotenv.config("./.env", (err)=>{
	if(err){console.log(err)}
});

const oAuth2Client = new google.auth.OAuth2(process.env.OAUTH_CLIENTID, process.env.OAUTH_CLIENT_SECRET, "https://developers.google.com/oauthplayground")
google.options({auth: oAuth2Client})

oAuth2Client.setCredentials({ refresh_token: process.env.OAUTH_REFRESH_TOKEN })




async function sendMail() {
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    console.log(accessToken)
    // const refreshToken = await oAuth2Client.getRefreshToken();
    const transport = nodemailer.createTransport({
      service: 'gmail',
      host: 'oauth2.googleapis.com',
      auth: {
        type: 'OAuth2',
        user: process.env.USER,
        clientId: process.env.OAUTH_CLIENTID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
refreshToken: process.env.OAUTH_REFRESH_TOKEN,               
        accessToken: accessToken
    }});


    const mailOptions = {
      from: process.env.USER,
      to: "ts765147@gmail.com",
      subject: 'Hello from gmail using API',
      text: 'Hello from gmail email using API',
      html: '<h1>Hello from gmail email using API</h1>',
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error + "\nerrorororor";
  }
}



const ejsLint = require('ejs-lint');

var app = express();

app.use(
	bodyParser.urlencoded({
		extended:true
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
    cb(null, __dirname+"/src");
    },
    filename: function(req, file, cb) {
     cb(null, new Date().toISOString().replace(/:/g, '-')+ file.originalname);
      }
  });
  
var upload = multer({ storage: storage });








app.get("/", (req, res)=>{
	res.render("home.ejs")
});

// console.log(process.env.username);


app.get("/about", (req, res)=>{
	res.render("about.ejs");
});

app.get("/contact", (req, res)=>{
	res.render("contact.ejs");
});

app.post("/queryposted", (req, res)=>{
	var today = new Date();
	var query = {
		name: req.body.name,
		title: req.body.title,
		message: req.body.message,
		email: req.body.email,
		date: String(today)
	}
	console.log(query);
	Query.create(query, (err, objj)=>{
		if(err){console.log(err)}
			else{
				
				objj.save()
				res.render("contact.ejs", {message: "Your message has been received, we will get in touch soon"});

async function sendMail() {
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    console.log(accessToken)
    // const refreshToken = await oAuth2Client.getRefreshToken();
    const transport = nodemailer.createTransport({
      service: 'gmail',
      host: 'oauth2.googleapis.com',
      auth: {
        type: 'OAuth2',
        user: process.env.USER,
        clientId: process.env.OAUTH_CLIENTID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
refreshToken: process.env.OAUTH_REFRESH_TOKEN,               
        accessToken: accessToken
    }});


    const mailOptions = {
      from: "Queries - TGF <"+process.env.USER+">",
      to: process.env.ADMIN,
      subject: 'New Query',
      text: 'Hello from gmail email using API',
	  html: '<div><h3>'+objj.title+'</h3><p>'+objj.message+'</p><br><b>Name:'+objj.name+"<br><b>Email:<a href=mailto:"+objj.email+">"+  query.email+"</a><br><b>Date:</b>"+String(objj.date)+"<hr></div>"
      
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error + "\nerrorororor";
  }
}
				sendMail()
				  .then((result) => console.log('Email sent...', result))
				  .catch((error) => console.log("errorororor"));
// var mailDetails = {
//     from: process.env.USER,
//     to: process.env.USER,
//     subject: 'Website Query:' + objj.title,
//     amp: '<div><h3>'+objj.title+'</h3><p>'+objj.message+'</p><br><b>Name:'+objj.name+"<br><b>Email:<a href=mailto:"+objj.email+">"+  query.email+"</a><br><b>Date:</b>"+String(objj.date)+"<hr></div>"
// };
				
		};
			}
	)})






app.get("/admin", (req, res)=>{
	Image.find({}, (err, items)=>{
		if(err){console.log(err)}
		else{
			Query.find({}, (err, querie)=>{
				if(err){console.log(err)}
					else{
			res.render("admin.ejs", {images: items, queries: querie});

					}
			})

		}
	})

	
});
var directory = __dirname+"/src";

app.get("/clear", (req, res)=>{
	 



fs.readdir(directory, (err, files) => {
  if (err) throw err;

  for (const file of files) {
    fs.unlink(path.join(directory, file), err => {
      if (err) throw err;
    });
  }
});
			
			res.redirect("/admin");
	

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
