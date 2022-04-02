var router = require("express").Router({mergeParams: true});
var Event = require("../../models/Event.js");
var Volunteer = require("../../models/Volunteer.js");


router.get("/event/:id", (req, res)=>{
    Event.findById(req.params.id, (err, event)=>{
        if(err || event.length<1){
            req.flash("error", "We are unable to display this event at this time, please try again later");
            res.redirect("/")
        }else{
                var volunteersArr = [];
                event.volunteers.forEach(function(volunteer, index){
                    console.log(volunteer)
                    Volunteer.findById(volunteer.id, (err, volunteer)=>{
                        if(err){
                            req.flash("error", "We are unable to display this event at this time, please try again later");
                        }else{  
                            volunteersArr.push(volunteer);
                            if((index+1) == event.volunteers.length){
                                res.render("event.ejs",{event: event, volunteers: volunteersArr, page: ["Events", event.name]})
                            }
                        }
                    })
                })

                
            }
    })
});

router.get("/events/:tag", (req, res)=>{
    Event.find({tag: req.params.tag, published: true}, (err, events)=>{
        if(err || events.length<1){
            req.flash("error", "Sorry, but we are unable to get the requested page at the moment. Please try again later.");
            res.redirect("back");
        }else{
            res.render("tagPage.ejs", {tag: req.params.tag, events: events, page: ["Events", tag]});
        }
    })
})
module.exports = router;