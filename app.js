var express = require("express");
var mongoose = require("mongoose");
var mongodb = require("mongodb");
var bodyParser = require("body-parser");
var path = require("path");
var dotenv = require("dotenv");
var multer = require('multer');
var fs = require("fs");
var multer = require('multer');
// var multer2 = require("multer");
const flash = require('connect-flash');
const session = require('express-session');  // session middleware
const passport = require('passport');  // authentication
const connectEnsureLogin = require('connect-ensure-login'); //authorization
var nodemailer = require("nodemailer");
const Razorpay = require("razorpay");
var Binary = require('mongodb').Binary;
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
     // useCreateIndex: true,
    // useFindAndModify: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // autoIndex: true,
}, (err) => {
    if (err) {
        console.log(err)
    }
})

//Importing routes, mongodb and mongoose schemas from models folder
var Query = require("./models/Query.js");
var Admin = require("./models/Admin.js");
var Image = require("./models/ImageSchema.js");
var Blog = require("./models/Blog.js");
var Volunteer = require("./models/Volunteer.js");


app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60 * 60 * 1000*72 } // 3 days
}));
// Admin.register({username: process.env.TGF, active: false}, process.env.TGFP)

// app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());
passport.use(Admin.createStrategy());
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());
app.use(flash());




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
    cb(console.log("hi"), new Date().toISOString().replace(/:/g, '-') + file.originalname);
  },
});



var upload = multer({
    storage: storage
});
var pdfUpload = multer({
    storage: pdfStorage
})





var loginRoutes = require("./loginRouter.js");
var adminRoutes = require("./adminRouter.js");

app.use(loginRoutes);
// app.use(adminRoutes); 

app.get("/", (req, res) => {
    res.render("home.ejs")
});
app.get("/admin/dashboard/volunteers/applications", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
    
        Volunteer.find({approved: false}, (err, volunteee)=>{
            if(err){res.redirect('back')}
            else{
                res.render("volunteerApplications.ejs", {volunteers: volunteee.reverse()})
            }
        })
    
    
});
app.get("/about", (req, res) => {
    res.render("about.ejs");
});

app.get("/contact", (req, res) => {
    var message = req.flash('message');
    res.render("contact.ejs", {message: message});


});
app.get("/apply/volunteer", (req, res)=>{
    var message = req.flash("message");
    res.render("volunteerApplication.ejs", {message: message});
});
app.post("/apply/volunteer", pdfUpload.single("cv"), (req, res, next)=>{
    var today = new Date()
    // application/pdf
    console.log("hi")
    var objjj = {
        name: req.body.name,
        description: req.body.description,
        email: req.body.email,
        phone: req.body.phone,
        approved: false,
        date: String(today),
        cv: {
            data: fs.readFileSync(path.join(__dirname + '/src/cv/' + req.file.filename)),
            contentType: 'application/pdf'
        }
    }

    Volunteer.create(objjj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {

            item.save();
            req.flash("message", "Your application has been received, we will get in touch soon.");
            res.redirect('/apply/volunteer');
        }
    });

})

app.post("/queryposted", (req, res) => {
    var today = new Date()


    var query = {
        name: req.body.name,
        title: req.body.title,
        message: req.body.message,
        email: req.body.email,
        date: String(today)
    }
    console.log(query);
    Query.create(query, (err, objj) => {
        if (err) {
            console.log(err)
        }
        else {

            objj.save()
            var mailOptions = {
                        from: "Queries - TGF <" + process.env.USER + ">",
                        to: process.env.ADMIN,
                        subject: 'New Query',
                        text: objj.title+"\n"+objj.message+"\n"+objj.name+"\n"+objj.email+"\n"+ String("objj.date"),
                        html: '<div><h3>' + objj.title + '</h3><p>' + objj.message + '</p><br><b>Name:' + objj.name + "<br><b>Email:<a href=mailto:" + objj.email + ">" + query.email + "</a><br><b>Date:</b>" + String(objj.date) + "<hr></div>"

                    };
            sendMail(mailOptions)
                .then((result) => {
                    req.flash("message", "Your message has been received, we will get in touch soon.");
            res.redirect("/contact")
                })
                .catch((error) => console.log("errorororor"));
            // var mailDetails = {
            //     from: process.env.USER,
            //     to: process.env.USER,
            //     subject: 'Website Query:' + objj.title,
            //     amp: '<div><h3>'+objj.title+'</h3><p>'+objj.message+'</p><br><b>Name:'+objj.name+"<br><b>Email:<a href=mailto:"+objj.email+">"+  query.email+"</a><br><b>Date:</b>"+String(objj.date)+"<hr></div>"
            // };

        };
    })
})


app.get("/admin", connectEnsureLogin.ensureLoggedIn(),  (req, res) => {
    Image.find({}, (err, items) => {
        if (err) {
            console.log(err)
        }
        else {
            Query.find({}, (err, querie) => {
                if (err) {
                    console.log(err)
                }
                else {
                    res.render("admin.ejs", {
                        images: items,
                        queries:  querie.reverse()
                    });

                }
            })

        }
    })


});








app.post('/test', upload.single('image'), (req, res, next) => {

    var obj = {
        name: req.body.name,
        desc: req.body.desc,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/src/img/' + req.file.filename)), //Change this to an appropriate
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


//Razorpay Integration (currently testing)

// var instance = new Razorpay({
//   key_id: process.env.RZP_KEY_ID,
//   key_secret: process.env.RZP_KEY_SECRET,
// });

// instance.orders.create({
//   amount: 50000,
//   currency: "INR",
//   receipt: "receipt#1",
//   notes: {
//     key1: "value3",
//     key2: "value2"
//   }
// })


// var options = {
//   amount: 50000,  // amount in the smallest currency unit
//   currency: "INR",
//   receipt: "order_rcptid_11",
//   partial_payment: false,

// };
// instance.orders.create(options, function(err, order) {
//   console.log(order);
// });


app.get("/donate", (req, res)=>{
    res.render("donate.ejs");
})




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


app.listen(process.env.PORT, process.env.IP, () => {
    console.log("process begun");
});