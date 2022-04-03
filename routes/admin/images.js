var auth = require("../commonFunctions/auth.js");
var router = require("express").Router({mergeParams: true});
var imgUpload = require("../commonFunctions/upload.js");
var Image = require("../../models/ImageSchema.js");
var Volunteer = require("../../models/Volunteer.js");
var Event = require("../../models/Event.js");


var multer = require("multer")
var fs = require("fs")
var path = require("path")
var cloudinary = require("cloudinary").v2
var crypto = require('crypto')
var dotenv = require("dotenv")

dotenv.config()
cloudinary.config({ 
    cloud_name: "tecso-foundation", 
    api_key: "869436858694119",
    api_secret: "zYBZoO_pNBaVxiFB2rUqh3t4SDE" ,
});
var shasum = crypto.createHash('sha1')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname + "/src/img"));
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
});
const upload = multer({
    storage: storage
});


//Home slider images
router.post('/images', auth, upload.single('image'), (req, res, next) => {
    var imgPath = path.join(__dirname + '/src/img/' + req.file.filename);
    imgUpload.imgUpload("/admin/dashboard/images", imgPath, req.file.originalname, "heh3ulpt", req, res, "Home Slider" , function(){
        var obj = {
            link: req.body.imgLink,
            public_id: req.body.public_id,
            number: req.body.number,
            home: true
        }
        Image.create(obj, (err, item) => {
            if (err) {
                req.flash("error", "Database error: Couldn't save image link, please contact the developer. "+err.message)
                res.redirect("back")
            }else{
                req.flash("message", "Image added")
                res.redirect('/admin/dashboard/images/slider');
            }
        });
    });
    
});

router.get("/admin/dashboard/images/volunteers", auth, (req, res)=>{
    var images = []
    Volunteer.find({approved: true}, (err, volunteers)=>{
        if(err||!(volunteers)){
            req.flash("error", "Database error: Cannot retrieve volunteers. There may not be any.")
            res.redirect("back");
        }else{
            volunteers.forEach(function(volunteer){
                images.push({context: volunteer.name+"; Approved: "+volunteer.approved, 
                    link: volunteer.profilePic.link, 
                    public_id: volunteer.profilePic.public_id,
                    _id: volunteer._id
                })
            }
        )
        res.render("admin/images.ejs", {images: images, page: ["Admin", "Images", "Volunteers"]})
        }
    })
})

router.get("/admin/dashboard/images/slider", auth, (req, res)=>{
    Image.find({home: true}, function(err, gs){
        var images = []
        if(err){
            req.flash("error", "Database error: Unable to retrieve home images")
            res.redirect("back")
        }else{
            gs.forEach(function(img, index){
                images.push({context: "Home-slider-"+String(index+1), public_id: img.public_id, link: img.link, _id: img._id})
            })
            res.render("admin/images.ejs", {images: images, page: ["Admin", "Images", "Home-slider"]})

        }})})

router.get("/admin/dashboard/images/volunteers/:id", auth, (req, res)=>{
    Volunteer.findById(req.params.id, (err, volunteer)=>{
        if(err){
            req.flash("error", "Database error: Cannot find volunteer")
        }else{
            res.render("admin/imageReplace.ejs", {image: {link: volunteer.profilePic.link, _id:volunteer._id}, page: ["Admin", "Images", "Volunteers", volunteer.name]})
        }
    })
})
router.get("/admin/dashboard/images/slider/:id", auth, (req, res)=>{
    Image.findById(req.params.id, (err, image)=>{
        if(err){
            req.flash("error", "Database error: Cannot find image")
        }else{
            res.render("admin/imageReplace.ejs", {image: image, page: ["Admin", "Images", "Home-slider", image.context]})
        }
    })
})

router.post("/admin/dashboard/images/volunteers/:id", auth, upload.single("image"), (req, res)=>{
    var imgPath = path.join(__dirname + '/src/img/' + req.file.filename);
    imgUpdateVolunteer(req.params.id, imgPath, req, res);
})
router.post("/admin/dashboard/images/slider/:id", auth, upload.single("image"), (req, res)=>{
    var imgPath = path.join(__dirname + '/src/img/' + req.file.filename);
    imgUpdateSlider(req.params.id, imgPath, req, res);
})

var imgUpdateVolunteer = function(id, imgPath, req, res){
    Volunteer.findById(id, (err, volunteer)=>{
        if(err){
            req.flash("error", "Database error: "+error.message+". The image either doesn't exist, or we cannot delete it");
            res.redirect("/admin/dashboard/images")
        }else{
            console.log("?????")
            var signature = cloudinary.utils.api_sign_request({
                timestamp: cloudinary.utils.timestamp(),
            }, process.env.CLOUDINARY_API_SECRET)
            // var signature = shasum.update("public_id="+image.public_id+"&timestamp="+String(timestamp)).digest("hex")

            cloudinary.uploader.destroy(volunteer.profilePic.public_id, signature, (error, result)=>{
                if(error){
                    console.log(error)
                    req.flash("error", "Cloud error: "+error.message+". The image either doesn't exist, or we cannot delete it");
                    res.redirect("/admin/dashboard/images/volunteers")
                }else{
                    console.log(result)
                    cloudinary.uploader.unsigned_upload(imgPath, "profilePic", {
                        timestamp: cloudinary.utils.timestamp(),
                        public_id: result.public_id
                    })
                    .then((image)=>{

                        volunteer.profilePic.link = image.url;
                        volunteer.profilePic.public_id = image.public_id
                        volunteer.save()
                        fs.rmSync(imgPath)
                        req.flash("message", "Image updated!")
                        res.redirect("/admin/dashboard/images/volunteers")
                    })
                    .catch((error)=>{
                        console.log(error)
                        fs.rmSync(imgPath)
                        req.flash("error", "Cloud error: "+error.message+". The image couldn't be updated");
                        res.redirect("/admin/dashboard/images/volunteers")
                    });
                }
            })
        }
    })
}
var imgUpdateSlider = function(id, imgPath, req, res){
    Image.findOne({_id: id, home: true}, (err, image)=>{
        if(err){
            req.flash("error", "Database error: "+error.message+". The image either doesn't exist, or we cannot delete it");
            res.redirect("/admin/dashboard/images")
        }else{
            console.log("?????")
            var signature = cloudinary.utils.api_sign_request({
                timestamp: cloudinary.utils.timestamp(),
                public_id: image.public_id
            }, process.env.CLOUDINARY_API_SECRET)
            // var signature = shasum.update("public_id="+image.public_id+"&timestamp="+String(timestamp)).digest("hex")
            console.log(image)
            cloudinary.uploader.destroy(image.public_id, signature, (error, result)=>{
                if(error){
                    console.log(error)
                    req.flash("error", "Cloud error: "+error.message+". The image either doesn't exist, or we cannot delete it");
                    res.redirect("/admin/dashboard/images/slider")
                }else{
                    console.log(result)
                    cloudinary.uploader.unsigned_upload(imgPath, "heh3ulpt", {
                        timestamp: cloudinary.utils.timestamp(),
                    })
                    .then((img)=>{
                        image.link = img.url;
                        image.public_id = img.public_id
                        image.context = req.body.context
                        image.save()
                        fs.rmSync(imgPath)
                        req.flash("message", "Image updated!")
                        res.redirect("back")
                    })
                    .catch((error)=>{
                        console.log(error)
                        fs.rmSync(imgPath)
                        req.flash("error", "Cloud error: "+error.message+". The image couldn't be updated");
                        res.redirect("back")
                    });
                }
            })
        }
    })
}


module.exports = router
