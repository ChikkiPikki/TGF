const express = require('express');
const router = express.Router();
const connectEnsureLogin = require('connect-ensure-login');
const passport = require('passport');



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



router.get("/admin/dashboard/:page", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
	res.render(req.params.page);
});

















module.exports = router;