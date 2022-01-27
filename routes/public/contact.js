var router = require("express").Router();
var Query = require("../../models/Query.js")
var sendMail = require("../commonFunctions/sendMail.js");
var Errorgen = require("../models/Error.js");

router.get("/contact", (req, res) => {
    var message = req.flash('message');
    res.render("contact.ejs", {message: message, page: "Contact"});
});


router.post("/queryposted", (req, res) => {
    var today = new Date()
    var query = {
        name: req.body.name,
        title: req.body.title,
        message: req.body.message,
        email: req.body.email,
        date: String(today)
    }
    console.log(query);
    Query.create(query, (err, objj) => {
        if (err) {
            req.flash("message", "We cannot accept your query at this time. Kindly reach out to us via our email, or via call");
            res.redirect("/contact");
        }
        else {

            objj.save()
            var mailOptions = {
                        from: "Queries - TGF <" + process.env.USER + ">",
                        to: process.env.ADMIN,
                        subject: 'New Query',
                        text: objj.title+"\n"+objj.message+"\n"+objj.name+"\n"+objj.email+"\n"+ String("objj.date"),
                        html: '<div><h3>' + objj.title + '</h3><p>' + objj.message + '</p><br><b>Name:' + objj.name + "<br><b>Email:<a href=mailto:" + objj.email + ">" + query.email + "</a><br><b>Date:</b>" + String(objj.date) + "<hr></div>"
                    };
            sendMail(mailOptions)
                .then((result) => {
                    req.flash("message", "Your message has been received, we will get in touch soon.");
                    res.redirect("/contact")
                })
                .catch((error) => {
                	var today = new Date()
                    Errorgen.create({
                    	fromFeature: "Query mail",
                    	date: String,
                    	message: "A query has not been sent on the admin's mail, kindly contact the developer to fix this issue"
                    }, (err, nerr)=>{
                    	if(err){
                    		res.redirect("/contact")
                    	}else{
                    		res.redirect("/contact")
                    	}
                    });
                });
        };
    })
});

module.exports = router;

