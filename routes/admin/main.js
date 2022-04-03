var router = require("express").Router({mergeParams: true});
var auth = require("../commonFunctions/auth.js");
var passport = require("passport");
var Meta = require("../../models/Meta.js")


router.get("/login", (req, res)=>{
	res.render("adminLogin.ejs", {page: ["Admin", "Login"]});
})

router.post("/login", passport.authenticate('local', {failureRedirect:'/login', successRedirect: '/admin'}), (req, res)=>{

});

router.get("/admin", auth, (req, res)=>{
    res.render("admin/home.ejs", {page: ["Admin", "Dashboard"]});
});
router.get("/admin/meta/:name", auth, (req, res)=>{
	Meta.findOne({name: req.params.name}, (err, entries)=>{
		if(err){
			req.flash("error", "Database error: "+error.message+". Please try again later")
			res.redirect("back")
		}else{
			res.render("admin/meta.ejs", {meta: entries})
		}
	})
});
router.post("/admin/meta/:name", auth, (req, res)=>{
	Meta.findOneAndUpdate({name: req.params.name}, {value: req.body.number}, (err, entry)=>{
		if(err){
			req.flash("error", "Database error: "+error.message+". Please try again later")
			res.redirect("back")
		}else{
			req.flash("message", "Meta "+req.params.name+" updated.")
			res.redirect("/admin")
		}
	})
})


module.exports= router;