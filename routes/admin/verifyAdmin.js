var verifyAdmin = function(req, res, nex){
	if(req.isAuthenticated){
		next();
	}else{
		req.flash("Message", "You are not authorised to do that.");
		res.redirect("/unauthorised");
	}
}

module.exports = verifyAdmin