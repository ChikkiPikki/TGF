var router = require("express").Router({mergeParams: true});
var auth = require("../commonFunctions/auth.js");
var passport = require("passport");


router.get("/login", (req, res)=>{
	res.render("adminLogin.ejs", {page: ["Admin", "Login"]});
})

router.post("/login", passport.authenticate('local', {failureRedirect:'/login', successRedirect: '/admin'}), (req, res)=>{

});

router.get("/admin", auth, (req, res)=>{
    res.render("admin/home.ejs", {page: ["Admin", "Dashboard"]});
});


module.exports= router;