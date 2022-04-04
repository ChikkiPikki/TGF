var router = require("express").Router({mergeParams: true});

var upload = require("../commonFunctions/upload.js");
var Volunteer = require("../../models/Volunteer.js");
var auth = require("../commonFunctions/auth.js");

router.get("/volunteers/", auth, (req, res)=>{
    Volunteer.find({approved: true}, (err, volunteers)=>{
        res.render("volunteers/volunteers.ejs", {volunteers: volunteers.reverse(), page: ["Admin", "Volunteers", "Approved"]})
    })
})

router.get("/volunteers/applications", auth, (req, res)=>{
    
        Volunteer.find({approved: undefined}, (err, volunteers)=>{
            if(err){
            	req.flash("error", "Database error: Cannot get volunteer applications "+err.message)
            	res.redirect('back')
	        }else{
                res.render("volunteers/volunteerApplications.ejs", {volunteers: volunteers.reverse(), page: ["Admin", "Volunteers", "Applications"]})
            }
        })
});

router.get("/volunteers/:id", auth, (req, res)=>{
    var id = req.params.id
    Volunteer.findById(id, (err, volunteer)=>{
        if(err){
        	req.flash("error", err.message); 
        	res.redirect("back"); 
        }else{
                res.render("volunteers/volunteerPage.ejs", {volunteer: volunteer, page: ["Admin", "Profile", volunteer.name]});
        }
    });
});

router.post("/volunteers/:id", auth, (req, res)=>{
    var idd =req.params.id;
    var today = new Date()
    Volunteer.findByIdAndUpdate(idd, {
        description: req.body.description,
        role: req.body.role,
        approved: req.body.approved,
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        date: today
    }, (err, volunteer)=>{
        if(err){
        	req.flash("error", "Database Error: Unable to update volunteer "+err.message);
        	res.redirect("/admin/dashboard/volunteers/"+volunteer._id); 
        }else{
            res.redirect("/admin/dashboard/volunteers/")
        }
    })
})
router.post("/volunteers/:id/delete", auth, (req, res)=>{
    Volunteer.findOneAndDelete({_id:req.params.id}, (err)=>{
        if(err){
        	req.flash("error", err.message); res.redirect("back")
        }else{
            res.redirect("/admin/dashboard/volunteers")
        }
    });
});

module.exports = router;
