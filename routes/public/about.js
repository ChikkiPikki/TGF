var router = require("express").Router();

router.get("/about", (req, res) => {
    res.render("about.ejs", {page: ["About"]});
});

module.exports = router;