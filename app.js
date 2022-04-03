var express = require("express");
var mongoose = require("mongoose");
var mongodb = require("mongodb");
var bodyParser = require("body-parser");
var path = require("path");
var dotenv = require("dotenv");
var multer = require('multer');
var fs = require("fs");
var multer = require('multer');
var cloudinary = require("cloudinary").v2
const flash = require('connect-flash');
const session = require('express-session');  // session middleware
const passport = require('passport');  // authentication
const connectEnsureLogin = require('connect-ensure-login'); //authorization
var nodemailer = require("nodemailer");
const Razorpay = require("razorpay");
var crypto = require("crypto");
var helmet = require("helmet")
const {
    google
} = require("googleapis")
const ejsLint = require('ejs-lint');
var directory = __dirname + "/src";

dotenv.config("./.env", (err) => {
    if (err) {
        console.log(err)
    }
});

//Google Authentication
const oAuth2Client = new google.auth.OAuth2(process.env.OAUTH_CLIENTID, process.env.OAUTH_CLIENT_SECRET, "https://developers.google.com/oauthplayground")
google.options({
    auth: oAuth2Client
})
oAuth2Client.setCredentials({
    refresh_token: process.env.OAUTH_REFRESH_TOKEN
})

var app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());

app.set("view engine", "ejs");

app.set('views', path.join(__dirname, '/views/dynamic'));
app.use("/", express.static("./views"));

// app.use(helmet())
mongoose.connect(process.env.DB, {useNewUrlParser: true,useUnifiedTopology: true}, (err) => {if(err){console.log(err)}})

//Importing routes, mongodb and mongoose schemas from models folder
var Query = require("./models/Query.js");
var Admin = require("./models/Admin.js");
var Image = require("./models/ImageSchema.js");
var Event = require("./models/Event.js");
var Volunteer = require("./models/Volunteer.js");
var Donation = require("./models/Donation.js");


app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 1000*72 } // 3 days
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(Admin.createStrategy());
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());
app.use(flash());



// Add headers before the routes are defined
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(function(req, res, next){
    res.locals.error = req.flash("error");
    res.locals.message = req.flash("message");
    next();
})

app.use("/", require("./routes/public/home.js"));
app.use("/", require("./routes/public/donate.js"));
app.use("/", require("./routes/public/about.js"));
app.use("/", require("./routes/public/contact.js"));
app.use("/", require("./routes/public/volunteers.js"));
app.use("/", require("./routes/admin/main.js"));
app.use("/", require("./routes/public/events.js"))
app.use("/", require("./routes/admin/images.js"))
app.use("/admin/dashboard", require("./routes/admin/donations.js"));
app.use("/admin/dashboard", require("./routes/admin/queries.js"));
app.use("/admin/dashboard", require("./routes/admin/traffic.js"));
app.use("/admin/dashboard", require("./routes/admin/volunteers.js"));
app.use("/admin/dashboard/events", require("./routes/admin/events.js"));

app.get("*", (req, res)=>{
    res.render("404.ejs")
})


app.listen(process.env.PORT, () => {
    console.log("process begun");
});