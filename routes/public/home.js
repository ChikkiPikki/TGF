var router = require("express").Router();
var Image = require("../../models/ImageSchema.js");
var Event = require("../../models/Event.js");

router.get("/", (req, res)=>{
    Image.find({home: true}, (err, images)=>{
        if(err){
            req.flash("error", "Server Error: " + err.message)
            res.redirect("/")
        }else{
        	Event.find({published: true}, (err, events)=>{
        		if(err){
        			req.flash("error", "Server Error: "+err.message);
        			res.redirect("/");
        		}else{
		            res.render("test.ejs", {images: images, page:["Home"], events: events.reverse().slice(0, 10)});
        		}
        	})
        }
    })
});

module.exports = router;