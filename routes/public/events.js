var router = require("express").Router({mergeParams: true});
var Event = require("../../models/Event.js");
var Volunteer = require("../../models/Volunteer.js");

var colours= {
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
console.log(colours["Education"])

// router.get("/event/:id", async(req, res)=>{
//     Event.findById(req.params.id, (err, event)=>{
//         if(err || event.length<1){
//             req.flash("error", "We are unable to display this event at this time, please try again later");
//             res.redirect("/")
//         }else{
//                 var volunteersArr = [];
//                 event.volunteers.forEach(function(volunteer, index){
//                     console.log(volunteer)
//                     //Volunteer images
//                     try Volunteer.findById(volunteer._id, (err, voluntee)=>{
//                         if(err){
//                             req.flash("error", "We are unable to display this event at this time, please try again later");
//                         }else{  
//                             volunteersArr.push(voluntee);
//                         }
//                     })
//                     if(index+1 == volunteersArr.length){
//                         console.log(colours[event.tag])
//                         res.render("event.ejs",{event: event, volunteers: volunteersArr, tagColour: colours[event.tag], page: ["Events", event.tag, event.name]})
//                     }
//                 })

                
//             }
//     })
// });

router.get("/event/:id", (req, res)=>{
    Event.findById(req.params.id, (err, event)=>{
        if(err || !(event)){
            req.flash("error", "We are unable to display this event at this time, please try again later");
            res.redirect("back")
        }else{
            var ids = []
            event.volunteers.forEach(function(volunteer){
                ids.push(volunteer._id)
            })
            Volunteer.find().where('_id').in(ids).exec((err, records) => {
                if(err){
                    req.flash("error", "Couldn't load event. Please try again later")
                    res.redirect("/")
                }else{
                    console.log(colours[event.tag])
                    res.render("event.ejs",{event: event, volunteers: records, tagColour: colours[event.tag], page: ["Events", event.tag, event.name]})
                }
            });
        }
    })
})

router.get("/events/:tag", (req, res)=>{
    Event.find({tag: req.params.tag, published: true}, (err, events)=>{
        if(err || !(events)){
            req.flash("error", "Sorry, but we are unable to get the requested page at the moment. Please try again later.");
            res.redirect("back");
        }else{
            res.render("tagPage.ejs", {tag: req.params.tag, events: events, tagColour: colours[req.params.tag], colours: colours, page: ["Events", req.params.tag]});
        }
    })
})


module.exports = router;