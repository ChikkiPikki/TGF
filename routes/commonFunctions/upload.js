var cloudinary = require("cloudinary").v2
var Image = require("../../models/ImageSchema.js");
var fs = require("fs");



var imgUpload = function(req, res, errRed, imgPath, public_id, folder){
	
    const timestamp = Math.round((new Date).getTime()/1000);
	cloudinary.upload_unsigned(imgPath, "heh3ulpt", {
		timestamp: timestamp,    
        folder: folder,
		public_id: public_id
    })
	.then((upload)=>{
		fs.unlinkSync(imgPath);	
		return upload.url;
    })
    .catch((error)=>{
    	req.flash("error", "Cloud error: "+error.message+" Please try again later");
    	return res.redirect(errRed);
    })
}

var cvUpload = function(req, res, errRed, public_id, folder){
	var cvPath = req.files.cv[0].path;
    const timestamp = Math.round((new Date).getTime()/1000);
	cloudinary.upload_unsigned(cvPath, "cvUpload", {
		timestamp: timestamp,
		folder: "site_pdfs/cv",
		public_id: public_id
	})
	.then((upload)=>{
		fs.unlinkSync(cvPath);
		return upload.url;
	})
	.catch((error)=>{
		req.flash("error", "Cloud error: "+error.message+" Please try again later");
        return res.redirect(errRed);
	})
}

module.exports = {
	cvUpload: cvUpload, 
	imgUpload: imgUpload
}