var router = require("express").Router({mergeParams: true});
var Event = require("../../models/Event.js");
var Volunteer = require("../../models/Volunteer.js");
var Image = require("../../models/ImageSchema.js");
var auth = require("../commonFunctions/auth.js");
var uploadImg = require("../commonFunctions/upload.js");
var sendMail = require("../commonFunctions/sendMail.js");
var multer = require("multer");
var fs = require("fs");
const { ObjectId } = require('mongodb');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + "/src/img");
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
});
var upload = multer({
    storage: storage
});

router.get("/", auth, (req, res)=>{

    Event.find({published: false}, (err, events)=>{
        if(err){res.redirect("back")}
            else{
                res.render("admin/events.ejs", {events: events.reverse(), page: ["Admin", "Events", "Unpublished Events"]})
            }
    })
});




router.get("/create", auth, (req, res)=>{
    res.render("admin/newEvent.ejs", {page: ["Admin", "Events", "Create"]});
})


router.post("/create", auth, upload.array("images"), (req, res)=>{
    var eventObj = req.body.event;
    eventObj.published = false;
    var imgLinks = [];
    req.files.forEach(function(img, index){
        var imgPath = __dirname + '/src/img/' + req.files[index].filename;
        //Needs testing; try using async:
        uploadImg.imgUpload("/admin/dashboard/events/create", imgPath, req.files[index].originalname, "eventUpload", req, res, function(){
            imgLinks.push({link: req.body.imgLink, public_id: req.body.public_id});
            console.log("hi1")
            console.log(req.files.length)
            console.log(index)
            if(req.files.length == index+1){
                eventObj.content.img = imgLinks
                console.log("???")
                Event.create(eventObj, (err, event)=>{
                    if(err){
                        req.flash("error", "Database error: "+error.message);
                        res.redirect("/admin/dashboard/events/create");
                    }
                    else{
                        req.flash("message", "Event created!")
                        res.redirect("/admin/dashboard/events/"+event._id+"/")
                    }
                });
            }
        })
        
    });
});

router.get("/:id/", auth, (req, res)=>{
    Event.findById(req.params.id, (err, event)=>{
        if(err){console.log(err)}
            else{
                Volunteer.find({approved: true}, (err, volunteers)=>{
                    if(err){console.log(err)}
                        else{
                            var eventVolunteers = []
                            volunteers.forEach(function(volunteer){
                                eventVolunteers.push({
                                    _id: volunteer._id,
                                    name: volunteer.name,
                                    role: volunteer.role,
                                    profilePic: volunteer.profilePic
                                })
                            })
                            res.render("admin/eventPage.ejs", {event: event, volunteers: eventVolunteers, page: ["Admin", "Events", event.name]})
                        }
                })
                
            }
    })
})



router.post("/:id/delete", auth, (req, res)=>{
    Event.findById(req.params.id, (err, event)=>{
        if(err){
            req.flash("error", "Database Error: Unable to delete event. "+err.message )
        }else{
            event.content.img.forEach
            req.flash("message", "Event removed")
            res.redirect("/admin/dashboard/events")
        }
    })
});

var hi = "hi"
router.post("/:id/publish", auth, (req, res)=>{
    console.log(hi)
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Headers","*");
    console.log(req.body)
    Event.findById(req.params.id,  (err, event)=>{
        if(err){
            req.flash("error", "Event cannot be published; Database error: "+err.message)
            }else{
                req.body.forEach(function(v, index){
                    Volunteer.findById(v._id, (err, vol)=>{
                        if(err){
                            console.log("err")
                            req.flash("error", "Database error: "+err.message+". Please try again later")
                            res.redirect("back")
                        }else{
                            console.log("!!!")
                            event.volunteers.push(vol)
                            if(index+1 == req.body.length){
                                event.published = true
                                event.save()
                                console.log("?>?>")
                                event.donations.forEach(function(donation){
                                    var mailOptions = {
                                        from: "Donations - TecSo Foundation <" + process.env.USER + ">",
                                        to: donation.email,
                                        subject: 'Re: Your contribution to "'+event.name+'"',
                                        text: 'Dear '+donation.name+". We cannot thank you enough for your Rupees "+donation.amount/100 +" contribution towards "+event.name+". It gives us immense pleasure to let you know that your donation has been utilised in this event. To know more about the event, please visit https://tecsoglobalfoundation.herokurouter.com/events/" +event._id+". Thank you, once again. Yours truly TecSo Global Foundation Team", 
                                        html: '<h1>Dear '+donation.name+".</h1> <p> We cannot thank you enough for your Rupees "+String(donation.amount/100 )+" contribution towards "+event.name+".</p> <p>It gives us immense pleasure to let you know that your donation has been utilised in this event.</p><br> To know more about the event, please visit <a href='https://tecsoglobalfoundation.herokurouter.com/events/" +event._id+"'>here</a><img src='"+String(event.content.img[0].link)+"' style='height: 40%;width:40%;'>.<p> Thank you, once again.</p> <br><hr>Yours truly <br> <h3>The TecSo Global Foundation Team</h3>", 
                                    };
                                    console.log(mailOptions)
                                    sendMail(mailOptions).then((resut)=>{}).catch((error)=>{})
                                    console.log("hi010101")
                                });

                                req.body.forEach((volunteer, index)=>{
                                    console.log("!!!!!!")
                                    console.log("yooooooooooo")
                                    Volunteer.findById(volunteer._id, (err, volunteer2)=>{
                                        if(err){
                                            req.flash("error", "Database Error: Unable to update volunteers")
                                        }else{
                                            //Volunteer's event updation
                                            volunteer2.events.push(event);
                                            volunteer2.save()
                                            console.log("hellp")
                                            
                                        }
                                        req.flash("message","Event published");
                                        res.redirect("/event/"+event._id)
                                    })
                                })

                            }
                        }
                    })
                })
                
            }
    })
});

module.exports = router;