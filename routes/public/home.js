var router = require("express").Router();
var Image = require("../../models/ImageSchema.js");
var Event = require("../../models/Event.js");
var Meta = require("../../models/Meta.js")

router.get("/", (req, res)=>{
    Image.find({home: true}, (err, images)=>{
        if(err){
            req.flash("error", "Server Error: " + err.message)
            res.redirect("/contact")
        }else{
        	Event.find({published: true}, (err, events)=>{
        		if(err){
        			req.flash("error", "Server Error: "+err.message);
        			res.redirect("/contact");
        		}else{
                    Meta.find({}, (err, entries)=>{
                        if(err){
                            req.flash("error", "Server Error: "+err.message);
                            res.redirect("/contact")
                        }else{
                            console.log(entries)
                            res.render("test.ejs", {images: images, page:["Home - TecSo Global Foundation"], colours: {
                                    "Education": "brown",
                                    "Health and Hygiene": "green",
                                    "Promotion of Sports and Music": "red",
                                    "Livelihood Enhancement Projects": "yellow",
                                    "Smile: Distribution of Life-essential Items": "violet",
                                    "Art and Craft for Children": "purple", 
                                    "Visit": "black",
                                    "Festivities": "orange",
                                    "Articles and Thoughts": "pink"
                            }, events: events.reverse().slice(0, 12), meta: entries});
                        }
                    })
		            
        		}
        	})
        }
    })
});
router.get("/privacy-policy", (req, res)=>{
    res.render("privacy-policy.ejs", {page: ["Website", "Privacy policy"]})
})
router.get("/terms-conditions", (req, res)=>{
    res.render("tc.ejs", {page: ["Website", "Terms and Conditions"]})
})



module.exports = router;