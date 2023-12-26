var router = require("express").Router({mergeParams: true});
var Event = require("../../models/Event.js");
var Volunteer = require("../../models/Volunteer.js");
var Image = require("../../models/ImageSchema.js");
var auth = require("../commonFunctions/auth.js");
var uploadImg = require("../commonFunctions/upload.js");
var mailBuilder = require("../commonFunctions/mailBuilder.js")
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
var colours = {
    "Education": "brown",
    "Health and Hygiene": "green",
    "Promotion of Sports and Music": "red",
    "Livelihood Enhancement Projects": "yellow",
    "Smile: Distribution of Life-essential Items": "violet",
    "Art and Craft for Children": "purple", 
    "Visit": "black",
    "Festivities": "orange",
    "Articles and Thoughts": "pink"
}

router.get("/", auth, (req, res)=>{

    Event.find({published: false}, (err, events)=>{
        if(err){res.redirect("back")}
            else{
                res.render("admin/events.ejs", {events: events.reverse(), page: ["Admin", "Events", "Unpublished Events"]})
            }
    })
});

router.get("/published", auth, (req, res)=>{

    Event.find({published: true}, (err, events)=>{
        if(err){res.redirect("back")}
            else{
                res.render("admin/events.ejs", {events: events.reverse(), page: ["Admin", "Events", "Published Events"]})
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
        uploadImg.imgUpload("/admin/dashboard/events/create", imgPath, req.files[index].originalname, "eventUpload", req, res, String(eventObj.name + " - ")+String(index+1), function(){
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
        if(err||!(event)){
            req.flash("error", "Event not found.")
        }
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
                            res.render("admin/eventPage.ejs", {event: event, volunteers: eventVolunteers, page: ["Admin", "Events", event.tag, event.name], tagColour: colours[event.tag]})
                        }
                })
                
            }
    })
})
var cloudinary = require("cloudinary").v2
cloudinary.config({ 
    cloud_name: "tecso-foundation", 
    api_key: "869436858694119",
    api_secret: "zYBZoO_pNBaVxiFB2rUqh3t4SDE" ,
});


router.post("/:id/delete", auth, (req, res)=>{
    Event.findById(req.params.id, (err, event)=>{
        if(err||!(event)){
            req.flash("error", "Database Error: Unable to find event." )
        }else{
            event.content.img.some(function(image, index){
                var signature = cloudinary.utils.api_sign_request({
                    timestamp: cloudinary.utils.timestamp(),
                    public_id: image.public_id
                }, process.env.CLOUDINARY_API_SECRET)
                cloudinary.uploader.destroy(image.public_id, signature)
                .then((result)=>{
                    console.log("deleted")
                    if(index+1 == event.content.img.length){
                        Event.deleteOne({_id: event._id}, (error)=>{
                            if(error){
                                req.flash("error", "Database error: Couldn't delete event")
                            }else{
                                req.flash("message", "Event removed")
                                res.redirect("/admin")
                            }
                        })
                    }
                })
                .catch((error)=>{
                    req.flash("error", "Cloud error: Couldn't delete event")
                    return res.redirect("back")
                })
            })
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
        if(err||!(event)){
            req.flash("error", "Event cannot be published; Database error")
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
                                event.save(()=>{
                                    event.donations.forEach(function(donation){
                                        var mailOptions = {
                                            from: "noreply.tgf@tecsoglobal.com",
                                            to: donation.email,
                                            subject: 'Re: Your contribution to "'+event.name+'"',
                                            text: 'Dear '+donation.name+". We cannot thank you enough for your Rupees "+donation.amount/100 +" contribution towards "+event.name+". It gives us immense pleasure to let you know that your donation has been utilised in this event. To know more about the event, please visit https://tecsoglobalfoundation.herokurouter.com/events/" +event._id+". Thank you, once again. Yours truly TecSo Global Foundation Team", 
                                            html: mailBuilder(donation, event)
                                        };
                                        
                                        console.log(mailOptions)
                                        sendMail(mailOptions).then((resut)=>{}).catch((error)=>{})
                                        console.log("hi010101")
                                    });
                                    req.body.forEach((volunteer, ind)=>{
                                        console.log("!!!!!!")
                                        console.log("yooooooooooo")
                                        Volunteer.findById(volunteer._id, (err, volunteer2)=>{
                                            if(err){
                                                req.flash("error", "Database Error: Unable to update volunteers")
                                            }else{
                                                //Volunteer's event updation
                                                volunteer2.events.push(event);
                                                volunteer2.save(()=>{
                                                    if(ind+1 == req.body.length){
                                                        req.flash("message","Event published");
                                                        res.redirect("/event/"+event._id)
                                                    }
                                                })
                                                console.log("hellp")
                                                
                                            }
                                        })
                                    })
                                })
                                console.log("?>?>")

                            }
                        }
                    })
                })
                
            }
    })
});

module.exports = router;