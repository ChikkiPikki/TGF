var auth = function(req, res, next){
	if(req.isAuthenticated()){
		next()
	}else{
		req.flash("message", "You are not authorised to access this page")
		res.redirect("back");
	}
}

module.exports = auth;