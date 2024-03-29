var cloudinary = require("cloudinary").v2
var Image = require("../../models/ImageSchema.js");
var fs = require("fs");



var imgUpload = function(errRed, imgPath, public_id, preset, req, res, context, successCallback){
    const timestamp = Math.round((new Date).getTime()/1000);
	cloudinary.uploader.unsigned_upload(imgPath, preset, {
		timestamp: timestamp,    
		public_id: public_id
    })
	.then((upload)=>{
		Image.create({link: upload.url, public_id: upload.public_id, context: context, preset: preset})
		.then((image)=>{
			fs.rmSync(imgPath,{
				force: true
			});
			req.body.imgLink = upload.url;	
			req.body.public_id = upload.public_id;
			successCallback();
		})
		.catch((error)=>{
			fs.rmSync(imgPath,{
				force: true
			});
			req.flash("error", "Database error: "+error.message+". Please try again later");
			console.log(error.message)
	        // res.redirect(errRed);
	        console.log("error")
		})
    })
    .catch((error)=>{
    	req.flash("error", "Cloud error: "+error.message+"; Can't upload image, Please try again later");
    	res.redirect(errRed);
    })
}

var cvUpload = function(errRed, cvPath, public_id, req, res, successCallback){
    const timestamp = Math.round((new Date).getTime()/1000);
	cloudinary.uploader.unsigned_upload(cvPath, "cvUpload", {
		timestamp: timestamp,
		folder: "site_pdfs/cv",
		public_id: public_id
	})
	.then((upload)=>{
		fs.rmSync(cvPath,{
			force: true
		});
		if(!(upload.url.search("https:"))){
			req.body.cvLink = upload.url.replace("http:", "https:");
		}else{
			req.body.cvLink = upload.url
		}
		req.body.public_id_cv = upload.public_id
		
		successCallback();
	})
	.catch((error)=>{
		fs.rmSync(cvPath,{
			force: true
		});
		req.flash("error", "Cloud error: "+error.message+" Please try again later");
        // res.redirect(errRed);
	})
}

module.exports = {
	cvUpload: cvUpload, 
	imgUpload: imgUpload
}