var router = require("express").Router({mergeParams: true});
var upload = require("../commonFunctions/upload.js");
var Volunteer = require("../../models/Volunteer.js");
var Event = require("../../models/Event.js");
var path = require("path")
var multer = require("multer");
var fs = require("fs")
const pdfStorage = multer.diskStorage({
  destination: function (req, file, cb)  {
    cb(null, path.join(__dirname + "/src/cv"));
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
  },
});
var pdfUpload = multer({
    storage: pdfStorage
});

router.get("/apply/volunteer", (req, res)=>{
    res.render("volunteers/volunteerApplication.ejs", {page: ["Apply"]});
});


router.post("/apply/volunteer",  pdfUpload.fields([
    {name: "cv", maxCount: 1 },
    {name: "img", maxCount: 1}
    ]), (req, res, next)=>{
        
        upload.imgUpload("/apply/volunteer", req.files.img[0].path, req.body.name, "profilePic", req, res, String(req.body.name), function(){
            upload.cvUpload("/apply/volunteer", req.files.cv[0].path, req.body.name, req, res, function(){
            var today = new Date()
            var volunteerObj = {
                name: req.body.name,
                description: req.body.description,
                email: req.body.email,
                phone: req.body.phone,
                date: today,
                cv: req.body.cvLink,
                profilePic: {link:req.body.imgLink, public_id: req.body.public_id}
            }
            console.log(req.body.imgLink)
            Volunteer.create(volunteerObj, (err, volunteer) => {
                if (err) {
                    req.flash("error", "We are unable to accept your application at this time. Kindly reach to us via email");
                    res.redirect("/apply/volunteer");
                }
                else {
                    volunteer.save();
                    console.log(volunteer)
                    req.flash("message", "Your application has been received, we will get in touch soon.");
                    res.redirect('/apply/volunteer');

                }
            })
        })
    });
})
router.get("/volunteer/:id", (req, res)=>{
    Volunteer.findById(req.params.id, (err, volunteer)=>{
        if(!(volunteer)||err){
            console.log("bruh")
            console.log(req.params.id)
            req.flash("error", "We are sorry, but no such volunteer is affiliated with us.");
            res.redirect("/");
        }else{
            console.log(volunteer)
            console.log("hi")
            var eventArr = [];
            var ids = []
            volunteer.events.forEach(function(event, index){
                console.log("hi0")
                ids.push(event._id)
            })
            Event.find({published: true}).where("_id").in(ids).exec((error, eve)=>{
                if(error){
                    req.flash("error", "Something went wrong while loading the requested page. Please try again later.")
                    res.redirect("back")
                }else if(!(eve)){
                    req.flash("message", volunteer.name+" has no participated in no events yet.")
                    res.redirect("back")
                }
                else{
                    eventArr.push(eve);
                    console.log(eve)
                    volunteer.eventArr = eventArr
                    res.render("volunteers/volunteerDisplay.ejs", {volunteer: volunteer, eventArr: eve, page: ["Volunteer contribution", volunteer.name], 
                        colours:{
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
                    });
                }
            })
            
        }
    })
})

router.get("/team-tgf", (req, res)=>{
    Volunteer.find({approved: true}, (err, volunteers)=>{
        if(err){
            req.flash("error", "Unable to display team page at this time, please try again later")
            res.redirect("back")
        }else{
            res.render("ourTeam.ejs", {volunteers: volunteers, page: ["Team - TecSo Global Foundation"]})
        }
    })
});

module.exports = router;