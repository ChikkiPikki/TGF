const express = require('express');
const app = express.app();
const connectEnsureLogin = require('connect-ensure-login');
const passport = require('passport');


<<<<<<< HEAD
var Volunteer = require("./models/Volunteer.js")




=======

router.post("/login", passport.authenticate('local', {failureRedirect:'/login', successRedirect: '/admin'}), (req, res)=>{

});


 router.get("/login", (req, res)=>{
 	if (req.isAuthenticated()) {
  		res.redirect("/admin")
} else {
  // The user is logged out
 	res.render("adminLogin.ejs");

}
 })
>>>>>>> 8fb00fc (Revert "Add volunteer applications")



router.get("/admin/dashboard/:page", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
	res.render(req.params.page);
});











module.exports = app;