var auth = require("../commonFunctions/auth.js");
var router = require("express").Router({mergeParams: true});
var upload = require("../commonFunctions/upload.js");
var Image = require("../../models/ImageSchema.js");



//Home slider images
router.post('/images', auth, upload.single('image'), (req, res, next) => {
    var imgPath = path.join(__dirname + '/src/img/' + req.file.filename);
    var imgLink = upload.imgUpload("/admin/dashboard/images", imgPath, req.file.originalname, "heh3ulpt", req, res, function(){
        var obj = {
            link: imgLink,
            context: req.body.desc,
            number: req.body.number,
            originalname: req.file.originalname,
            home: true
        }
        Image.create(obj, (err, item) => {
            if (err) {
                req.flash("error", "Database error: Couldn't save image link, please contact the developer. "+err.message)
                res.redirect("back")
            }else{
                req.flash("message", "Image added")
                res.redirect('/admin/dashboard/images');
            }
        });
    });
    
});
router.post("/images/delete/:id/", auth, (req, res)=>{
    Image.delete(req.params.id, (err)=>{
        if(err){
            req.flash("error", "Database error: Cannot delete image. "+err.message);
            res.redirect("back")
        }else{
            req.flash("messge", "Image removed");
            res.redirect("/admin/dashboard/images");
        }
    });
});
router.get("/admin/dashboard/images", connectEnsureLogin.ensureLoggedIn(), (req, res)=>{
     Image.find({}, (err, items) => {
        if (err) {
            req.flash("error", "Database error: Cannot retrieve images. "+err.message);
            res.redirect("/admin/dashboard/images");
        }
        else {
            res.render("admin/images.ejs", {images: items.reverse()});
        }
})});
