var express = require("express");
var router = express.Router();

var auth = require("../commonFunctions/auth.js");
var mongooseErrors = require("./mongooseErrors.js");
var connectEnsureLogin = require("connect-ensure-login");
var Donation = require("../../models/Donation.js");
var Event = require("../../models/Event.js")





router.get("/admin/dashboard/donations/", auth, (req, res)=>{
    Donation.find({completed: true, utilised:false}, (err, donations)=>{
        if(err){
            req.flash("error", "Error: cannot get donations \nError message: "+err.message);
            res.redirect("/admin");
        }else{
            Event.find({published: false}, (err, events)=>{
                if(err){
                    req.flash("error", "Error: cannot get donations \nError message: "+err.message);
                    res.redirect("/admin");
                }else{
                        res.render("admin/donations.ejs", {donations: donations, events: events})
                    }
            })
        }
    });
})


router.post("/admin/dashboard/donations/:id", auth, (req, res)=>{
    Event.findById(req.body.event, (err, event)=>{
        if(err){console.log(err)}
            else{
                Donation.findByIdAndUpdate(req.params.id, {utilised: true}, (err, donation)=>{
                    if(err){
                        req.flash("error", "Error: cannot post donations \nError message: "+err.message);
                        res.redirect("/admin/dashboard/donations");
                    }
                        else{
                            event.donations.push(donation)
                            event.save();
                            req.flash("message", "Donation added to "+event.name)
                            res.redirect("/admin/dashboard/donations")
                        }
                })
            }
    }); 
})

module.exports = router