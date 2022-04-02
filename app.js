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

app.use(
    bodyParser.urlencoded({
        extended: true
    }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, '/views/dynamic'));
app.use("/", express.static("./views"));

mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}, (err) => {
    if (err) {
        console.log(err)
    }
})

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

//Cloud Storage config
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_API_KEY, 
  api_secret: process.env.CLOUD_API_SECRET
});


//Multer configs
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + "/src/img");
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
});


const pdfStorage = multer.diskStorage({
  destination: function (req, file, cb)  {
    cb(null, __dirname + "/src/cv");
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
  },
});

const profStorage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, __dirname+ "/src/img");

    },
    filename: function(req, file, cb){
        cb(null, req.body.name + new Date().toISOString().replace(/:/g, '-') + file.originalname)
    }
})



var upload = multer({
    storage: storage
});
var pdfUpload = multer({
    storage: pdfStorage
});
var profUpload = multer({
    storage: profStorage
})


app.use("/", require("./routes/public/home.js"));
app.use("/", require("./routes/public/donate.js"));
app.use("/", require("./routes/public/about.js"));
app.use("/", require("./routes/public/contact.js"));
app.use("/", require("./routes/public/volunteers.js"));
app.use("/", require("./routes/admin/main.js"));
app.use("/", require("./routes/public/events.js"))
app.use("/admin/dashboard", require("./routes/admin/donations.js"));
app.use("/admin/dashboard", require("./routes/admin/queries.js"));
app.use("/admin/dashboard", require("./routes/admin/traffic.js"));
app.use("/admin/dashboard", require("./routes/admin/volunteers.js"));
app.use("/admin/dashboard/events", require("./routes/admin/events.js"));
























async function sendMail(options) {
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
                        }
                    });


                    

                    const result = await transport.sendMail(options);
                    return result;
                }
                catch (error) {
                    return error + "\nerrorororor";
                }
            }



            
        




//Admin controls
//  1. Volunteering requests
//  2. Volunteers' approval
//  3. Donations
//  4. Queries
//  4. Site images
//  5. Blogs





app.get("/admin/dashboard/images", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
     Image.find({}, (err, items) => {
        if (err) {
            console.log(err)
        }
        else {
            res.render("admin/images.ejs", {images: items.reverse(), page:"Site Images"});
        }
})});








//Admin controls
//  1. Volunteering requests
//  2. Volunteers' approval
//  3. Donations
//  4. Queries
//  4. Site images
//  5. Blogs



















//Events



//Actual Events


app.listen(process.env.PORT, () => {
    console.log("process begun");
});