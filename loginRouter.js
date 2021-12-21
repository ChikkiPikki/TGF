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
 	res.render("adminLogin.ejs");
}
 })


//Admin controls
//	1. Volunteering requests
//	2. Volunteers' approval
//	3. Donations
//	4. Queries
//	4. Site images
//	5. Blogs
























module.exports = router;