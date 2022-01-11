var checkMongooseErr = function(err){
	if(err){
		req.flash("message", "Something went wrong. Please retry, or contact us if you stil face this error");
		res.redirect("back")
	}
}
module.exports = checkMongooseErr();