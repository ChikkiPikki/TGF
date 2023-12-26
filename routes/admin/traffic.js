var auth = require("../commonFunctions/auth.js");
var router = require("express").Router({mergeParams: true});


router.get("/admin/dashboard/traffic", auth, (req, res)=>{
    res.render("admin/traffic.ejs", {page: ["Admin", "Site Traffic"]});
});

module.exports = router;