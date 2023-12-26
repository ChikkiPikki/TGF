var router = require("express").Router({mergeParams: true});
var auth = require("../commonFunctions/auth.js");
var Query = require("../../models/Query.js");

router.post("/clear/queries", auth, (req, res)=>{
    Query.deleteMany({}, (err)=>{
        if(err){console.log(err)}
            else{
                res.redirect("/admin")
            }
    })
});
router.get("/queries", auth, (req, res)=>{
    Query.find({}, (err, queries)=>{
        if(err){
        	req.flash("error", "Database error: "+err.message)
        }else{
                res.render("admin/queries.ejs", {queries: queries.reverse(), page:["Admin", "Queries"]});
            }
    })
});

module.exports = router;