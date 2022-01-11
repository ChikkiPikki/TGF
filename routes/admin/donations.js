var express = require("express");
var router = express.Router();

var verifyAdmin = require("./verifyAdmin.js");
var mongooseErrors = require("./mongooseErrors.js");
var connectEnsureLogin = require("connect-ensure-login");
var Donation = require("../../models/Donation.js");
var Event = require("../../models/Event.js")

router.get("/admin/dashboard/donations/", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
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

router.post("/admin/dashboard/donations/:id", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
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

module.exports = router