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
// var multer2 = require("multer");
const flash = require('connect-flash');
const session = require('express-session');  // session middleware
const passport = require('passport');  // authentication
const connectEnsureLogin = require('connect-ensure-login'); //authorization
var nodemailer = require("nodemailer");
const Razorpay = require("razorpay");
var Binary = require('mongodb').Binary;
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
var Event = require("./models/Event.js");
var Volunteer = require("./models/Volunteer.js");
var Donation = require("./models/Donation.js");


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


//Cloud Storage config
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_API_KEY, 
  api_secret: process.env.CLOUD_API_SECRET
});



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

const profStorage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, __dirname+ "/src/img/profile");

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
})



var profUpload = multer({
    storage: profStorage
})











// app.get("/", (req, res) => {
//     Event.find({}, (err, events)=>{
//         if(err){console.log(err)}
//             else{
//                 res.render("test.ejs")
//             }
//     })
    
// });
app.get("/", (req, res)=>{
    res.render("test.ejs")
})
app.get("/about", (req, res) => {
    res.render("about.ejs", {page: "about"});
});

app.get("/contact", (req, res) => {
    var message = req.flash('message');
    res.render("contact.ejs", {message: message, page: "contact"});


});
app.get("/apply/volunteer", (req, res)=>{
    var message = req.flash("message");
    res.render("volunteers/volunteerApplication.ejs", {message: message, page: "apply"});
});
app.post("/apply/volunteer",  pdfUpload.fields([
    {name: "cv", maxCount: 1 },{name: "img", maxCount: 1}
]), (req, res, next)=>{
    var today = new Date()
    // application/pdf
    console.log(req.files);
    console.log("hi");
    var objjj = {
        name: req.body.name,
        description: req.body.description,
        email: req.body.email,
        phone: req.body.phone,
        date: String(today),

        cv: {
            data: fs.readFileSync(req.files.cv[0].path),
            contentType: 'application/pdf'
        },
        profilePic:{
            data: fs.readFileSync(req.files.img[0].path),
            contentType: req.files.img[0].mimetype
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









app.post('/images', connectEnsureLogin.ensureLoggedIn(), upload.single('image'), (req, res, next) => {
    
    var obj = {
        name: req.body.name,
        desc: req.body.desc,
        location: req.body.location,
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
app.get("/testing", (req, res)=>{
    res.render("test.ejs", {page: "testing"});
})

app.get("/donate", (req, res)=>{
    res.render("donate.ejs", {page: "donate"});
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
app.post("/login", passport.authenticate('local', {failureRedirect:'/login', successRedirect: '/admin'}), (req, res)=>{

});


            
        


 app.get("/login", (req, res)=>{
    if (req.isAuthenticated()) {
        res.redirect("/admin")
} else {
    res.render("adminLogin.ejs", {page: "admin"});
}
 })

//Admin controls
//  1. Volunteering requests
//  2. Volunteers' approval
//  3. Donations
//  4. Queries
//  4. Site images
//  5. Blogs

app.get("/admin/dashboard/volunteers/", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
    Volunteer.find({approved: "Yes"}, (err, volunteers)=>{
        res.render("volunteers/volunteers.ejs", {volunteers: volunteers.reverse(), page:"Volunteers"})
    })
})

app.get("/admin/dashboard/volunteers/applications", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
    
        Volunteer.find({approved: undefined}, (err, volunteee)=>{
            if(err){res.redirect('back')}
            else{
                res.render("volunteers/volunteerApplications.ejs", {volunteers: volunteee.reverse(), page:"Volunteer applications"})
            }
        })
});

app.get("/admin/dashboard/volunteers/:id", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
    var iddd = req.params.id
    Volunteer.findById(iddd, (err, volunteer)=>{
        if(err){req.flash("error", err.message); res.redirect("back"); console.log(err)}
            else{
                res.render("volunteers/volunteerPage.ejs", {volunteer: volunteer, page: volunteer.name});

            }
    });
});

app.post("/admin/dashboard/volunteers/:id", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
    var idd =req.params.id;
    Volunteer.findByIdAndUpdate(idd, {
        description: req.body.description,
        role: req.body.role,
        approved: req.body.approved,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone
    }, (err, volunteer)=>{
        if(err){req.flash("error", err.message); res.redirect("back"); console.log(err)}
        else{
            volunteer.save()
            console.log("HI "+volunteer.approved)
            res.redirect("/admin/dashboard/volunteers/")
        }
    })
})
app.post("/admin/dashboard/volunteers/:id/delete", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
    Volunteer.findOneAndDelete({_id:req.params.id}, (err)=>{
        if(err){req.flash("err", err.message); res.redirect("back")}
        else{
            res.redirect("/admin/dashboard/volunteers")
        }
    });
});



app.get("/admin/dashboard/volunteers", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
    Volunteer.find({approved: "Yes"}, (err, volunteers)=>{
        console.log(volunteers)
        res.render("volunteers/volunteers.ejs", {volunteers: volunteers, page:"Volunteers"})
    })
})


app.get("/admin", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
    res.render("admin/home.ejs", {page: "Admin"});
});
app.get("/admin/dashboard/images", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
     Image.find({}, (err, items) => {
        if (err) {
            console.log(err)
        }
        else {
            res.render("admin/images.ejs", {images: items.reverse(), page:"Site Images"});
        }
})});
app.get("/admin/dashboard/traffic", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
    res.render("admin/traffic.ejs", {page: "Site traffic"});
});

app.get("/admin/dashboard/queries", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
    Query.find({}, (err, queries)=>{
        if(err){req.flash("err", err.message)}
            else{
                res.render("admin/queries.ejs", {queries: queries.reverse(), page:"Site Queries"})
            }
    })
});
app.post("/clear/queries", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
    Query.deleteMany({}, (err)=>{
        if(err){console.log(err)}
            else{
                res.redirect("/admin")
            }
    })
});




//Admin controls
//  1. Volunteering requests
//  2. Volunteers' approval
//  3. Donations
//  4. Queries
//  4. Site images
//  5. Blogs

app.get("/admin/dashboard/volunteers/", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
    Volunteer.find({approved: "Yes"}, (err, volunteers)=>{
        res.render("volunteers/volunteers.ejs", {volunteers: volunteers.reverse()})
    })
})

app.get("/admin/dashboard/volunteers/applications", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
    
        Volunteer.find({approved: undefined}, (err, volunteee)=>{
            if(err){res.redirect('back')}
            else{
                res.render("volunteers/volunteerApplications.ejs", {volunteers: volunteee.reverse()})
            }
        })
});

app.get("/admin/dashboard/volunteers/:id", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
    var iddd = req.params.id
    Volunteer.findById(iddd, (err, volunteer)=>{
        if(err){req.flash("error", err.message); res.redirect("back"); console.log(err)}
            else{
                res.render("volunteers/volunteerPage.ejs", {volunteer: volunteer});

            }
    });
});

app.post("/admin/dashboard/volunteers/:id", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
    var idd =req.params.id;
    Volunteer.findByIdAndUpdate(idd, {
        description: req.body.description,
        role: req.body.role,
        approved: req.body.approved,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone
    }, (err, volunteer)=>{
        if(err){req.flash("error", err.message); res.redirect("back"); console.log(err)}
        else{
            volunteer.save()
            console.log("HI "+volunteer.approved)
            res.redirect("/admin/dashboard/volunteers/")
        }
    })
})
app.post("/admin/dashboard/volunteers/:id/delete", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
    Volunteer.findOneAndDelete({_id:req.params.id}, (err)=>{
        if(err){req.flash("err", err.message); res.redirect("back")}
        else{
            res.redirect("/admin/dashboard/volunteers")
        }
    });
});
var donation = require("./routes/admin/donations.js")
app.use(donation);

app.get("/admin/dashboard/volunteers", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
    Volunteer.find({approved: "Yes"}, (err, volunteers)=>{
        console.log(volunteers)
        res.render("volunteers/volunteers.ejs", {volunteers: volunteers})
    })
})


app.get("/admin", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
    res.render("admin/home.ejs");
});
app.get("/admin/dashboard/images", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
     Image.find({}, (err, items) => {
        if (err) {
            console.log(err)
        }
        else {
            res.render("admin/images.ejs", {images: items.reverse()});
        }
})});
app.get("/admin/dashboard/traffic", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
    res.render("admin/traffic.ejs");
});

app.get("/admin/dashboard/queries", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
    Query.find({}, (err, queries)=>{
        if(err){req.flash("err", err.message)}
            else{
                res.render("admin/queries.ejs", {queries: queries.reverse()})
            }
    });
});
app.post("/clear/queries", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
    Query.deleteMany({}, (err)=>{
        if(err){console.log(err)}
            else{
                res.redirect("/admin")
            }
    })
});
app.post("/clear/cache", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
    
});





//Donations
var instance = new Razorpay({
    key_id: process.env.RZP_KEY_ID,
    key_secret: process.env.RZP_KEY_SECRET
});

app.post("/donate", (req, res)=>{
    var options = {
        amount: req.body.amount*100,
        currency: 'INR',
        receipt: 'normal_donation',
        notes:{
            phone: req.body.phone,
            email: req.body.email
        }
    }
    instance.orders.create(options, (err, order)=>{

        if(err){req.flash('err', err.message); res.redirect("/donate")}
        else{
            console.log("hi");
            var today = String(new Date());
            Donation.create({
                amount: req.body.amount*100,
                name: req.body.name,
                date: today,
                email: req.body.email,
                orderId: order.id,
                completed: false,
                phone: req.body.phone,
                utilised: false
            }, (err, entity)=>{
                if(err){req.flash("err", err.message); res.redirect("/donate")}
                else{
                    res.json({donation: entity, key: process.env.RZP_KEY_ID})
                }
            });

        }
    });
});



app.post("/donate/verify", (req, res)=>{
    console.log(req.body)
    var hmac = crypto.createHmac('sha256', process.env.RZP_KEY_SECRET);
    hmac.update(req.body.response.razorpay_order_id+"|"+req.body.response.razorpay_payment_id)
    var generated_signature = hmac.digest("hex");
    if(generated_signature==req.body.response.razorpay_signature){

        Donation.findOneAndUpdate({orderId : req.body.order_id}, {completed: true}, (err, donation)=>{
            donation.save()
        })
        Donation.findOne({orderId: req.body.order_id}, (err, donation)=>{
            if(err){res.redirect("/donate")}
                else{
                    res.send("verified")

                }
        })
        }
    else{
        res.send("not-verified")

    }
})  
app.get("/thankyou/:id", (req, res)=>{
    Donation.findOne({orderId:req.params.id}, (err, donation)=>{
        if(err){res.redirect("/donate")}
            else{
                res.render("thankyou.ejs", {donation: donation})
            }
    })
});


app.get("/admin/dashboard/donations", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
    Donation.find({completed: true, utilised:false}, (err, donations)=>{
        if(err){
            console.log(err)
        } else{
            Event.find({published: false}, (err, events)=>{
                if(err){console.log(err)}
                    else{
                        console.log(events)
            res.render("admin/donations.ejs", {donations: donations, events: events})

                    }
            })
        }
    });
})

app.post("/admin/dashboard/donations/:id", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
    Event.findById(req.body.event, (err, event)=>{
        if(err){console.log(err)}
            else{
                Donation.findByIdAndUpdate(req.params.id, {utilised: true}, (err, donation)=>{
                    if(err){res.redirect("/admin/dashboard/donations")}
                        else{
                            event.donations.push(donation)
                                        event.save();
                                        res.redirect("/admin/dashboard/donations")
                        }
                })
            }
    }); 
})


//Events
app.get("/admin/dashboard/events/", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
    var message = req.flash("message");

    Event.find({published: false}, (err, events)=>{
        if(err){res.redirect("back")}
            else{
                res.render("admin/events.ejs", {events: events.reverse(), message: message})
            }
    })
});




app.get("/admin/dashboard/events/create", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
    res.render("admin/newEvent.ejs")
})


app.post("/admin/dashboard/events/create", connectEnsureLogin.ensureLoggedIn(), upload.array("images"), (req, res)=>{
    console.log(req.body.event);
    var eventObj = req.body.event;
    var imgs = [];
    req.files.forEach(function(img, index){
         imgs.push({
                data:fs.readFileSync(path.join(__dirname + '/src/img/' + img.filename)), 
                contentType: img.mimetype
            })
    });
    eventObj.content.img = imgs;




    // eventObj.content.img = image object array
    Event.create(eventObj, (err, event)=>{

        if(err){console.log(err)}
            else{
                
                event.published = false;
                event.save();
                req.flash("message", "Event created!")
                res.redirect("/admin/dashboard/events/"+event._id+"/")
            }
    })
});

app.get("/admin/dashboard/events/:id/", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
    var message = req.flash("message")

    Event.findById(req.params.id, (err, event)=>{
        if(err){console.log(err)}
            else{
                Volunteer.find({approved: 'Yes'}, (err, volunteers)=>{
                    if(err){console.log(err)}
                        else{
                            var voluntees = []
                            volunteers.forEach(function(volunteer){
                                voluntees.push({
                                    _id: volunteer._id,
                                    name: volunteer.name,
                                    role: volunteer.role,
                                    profilePic: {
                                        data: volunteer.profilePic.data,
                                        contentType: volunteer.profilePic.contentType
                                    }
                                })
                            })
                            res.render("admin/eventPage.ejs", {event: event, volunteers: voluntees, message: message})
                        }
                })
                
            }
    })
})



app.post("/admin/dashboard/events/:id/delete", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
    Event.findByIdAndDelete(req.params.id, (err)=>{
        if(err){console.log(err)}
            else{
                req.flash("message", "Event removed")
                res.redirect("/admin/dashboard/events")
            }
    })
});

app.post("/test", (req, res)=>{
    console.log(req.body)
});

app.post("/admin/dashboard/events/:id/publish", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
res.header("Access-Control-Allow-Credentials", true);
res.header("Access-Control-Allow-Headers","*");
res.header("")
console.log(req.body)
    var finalEvent = {
        volunteers: req.body,
        published: true
    }
    Event.findByIdAndUpdate(req.params.id, finalEvent,  (err, event)=>{
        if(err){console.log(err)}
            else{
                event.donations.forEach(function(donation){
                    var mailOptions = {
                        from: "Donation - TecSo Foundation <" + process.env.USER + ">",
                        to: donation.email,
                        subject: 'Your contribution towards '+event.name,
                        text: 'Dear '+donation.name+". We cannot thank you enough for your Rupees "+donation.amount/100 +" contribution towards "+event.name+". It gives us immense pleasure to let you know that your donation has been utilised in this event. To know more about the event, please visit https://tecsoglobalfoundation.herokuapp.com/events/" +event._id+". Thank you, once again. Yours truly TecSo Foundation Team", 
                        html: '<h1>Dear '+donation.name+".</h1> <p> We cannot thank you enough for your Rupees "+donation.amount/100 +" contribution towards "+event.name+".</p> <p>It gives us immense pleasure to let you know that your donation has been utilised in this event.</p><br> To know more about the event, please visit <a href='https://tecsoglobalfoundation.herokuapp.com/events/" +event._id+"'>here</a>.<p> Thank you, once again.</p> <br><hr>Yours truly <br> <h3>The TecSo Foundation Team</h3>", 
                        
                    };
                    console.log(mailOptions)
                    sendMail(mailOptions).then((result)=>console.log(result))
                })
                req.flash("Event published");
                res.send("done");
            }
    })
});
//Actual Events
app.get("/events/:id", (req, res)=>{
    Event.findById(req.params.id, (err, event)=>{
        if(err){console.log(err)}
            else{
                var volunteersArr = [];
                event.volunteers.forEach(function(volunteer, index){
                    console.log(volunteer)
                    Volunteer.findById(volunteer.id).populate("profilePic").exec((err, volunteer)=>{
                        if(err){console.log(err)}
                            else{
                                console.log(volunteer.name)
                                volunteersArr.push({
                                    name: volunteer.name,
                                    role: volunteer.role,
                                    profilePic: volunteer.profilePic
                                })
                                // console.log(volunteersArr)
                                if((index+1) == event.volunteers.length ){
                                    res.render("event.ejs",{event: event, volunteers: volunteersArr})
                                }
                            }
                    })
                })

                
            }
    })
});


app.listen(process.env.PORT, () => {
    console.log("process begun");
});