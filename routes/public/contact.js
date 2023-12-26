var router = require("express").Router();
var Query = require("../../models/Query.js")
var sendMail = require("../commonFunctions/sendMail.js");

router.get("/contact", (req, res) => {
    var message = req.flash('message');
    res.render("contact.ejs", {message: message, page: ["Contact"]});
});


router.post("/queryposted", (req, res) => {
    if(req.body.message && req.body.title && req.body.email && req.body.name){
        if(req.body.message.length<=1000 && req.body.title.length<=1000 && req.body.email.length<=1000 && req.body.name.length<=1000){
            var today = new Date()
            var query = {
                name: req.body.name,
                title: req.body.title,
                message: req.body.message,
                email: req.body.email,
                date: String(today)
            }
            console.log(query);
            Query.create(query, (err, queryObj) => {
                if (err){
                    req.flash("message", "We cannot accept your query at this time. Kindly reach out to us via our email, or call us");
                    res.redirect("/contact");
                }else{
                    var mailOptions = { 
                                from: "noreply.tgf@tecsoglobal.com",
                                to: process.env.ADMIN,
                                subject: 'New Query',
                                text: query.title+"\n"+query.message+"\n"+query.name+"\n"+query.email+"\n"+ String(query.date),
                                html: '<div><h3>' + query.title + '</h3><p>' + query.message + '</p><br><b>Name:' + query.name + "<br><b>Email:<a href=mailto:" + query.email + ">" + query.email + "</a><br><b>Date:</b>" + String(query.date) + "<hr></div>"
                            };
                    sendMail(mailOptions)
                        .then((result) => {
                            req.flash("message", "Your message has been received, we will get in touch soon.");
                            console.log(result)
                            res.redirect("/contact")
                        })
                        .catch((error) => {
                            res.redirect("/contact");
                        });
                };
            })
        }else{
            req.flash("error", "Invalid inputs. Please retry.")
            res.redirect("back")
        }
    }else{
            req.flash("error", "Invalid inputs. Please retry with lesser characters.")
            res.redirect("back")
        }
    
});

module.exports = router;

