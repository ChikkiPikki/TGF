var router = require("express").Router();
const Razorpay = require("razorpay");
var auth = require("../commonFunctions/auth.js");
var crypto = require("crypto");
var Donation = require("../../models/Donation.js")

var instance = new Razorpay({
    key_id: process.env.RZP_KEY_ID,
    key_secret: process.env.RZP_KEY_SECRET
});
router.get("/donate", (req, res)=>{
    res.render("donate.ejs", {page: ["Donate"]})
})

router.post("/donate", (req, res)=>{
    console.log("???")
    var options = {
        amount: req.body.amount*100,
        currency: 'INR',
        receipt: 'normal_donation',
        notes:{
            phone: req.body.phone,
            email: req.body.email
        }
    }
    instance.orders.create(options, (err, order)=>{
        if(err){
            req.flash('error', "Donation error: We are unable to accept your donation at this moment. \nError message:"+err.message); 
            res.redirect("/donate");
        }
        else{
            console.log("...")
            var today = String(new Date());
            Donation.create({
                amount: req.body.amount*100,
                name: req.body.name,
                date: today,
                email: req.body.email,
                orderId: order.id,
                completed: false,
                phone: req.body.phone,
                utilised: false
            }, (err, entity)=>{
                if(err){
                    req.flash("error", "Donation error: We are unable to accept your donation at this moment. \nError message:"+err.message); res.redirect("/donate")
                    res.redirect("/donate");
                }
                else{
                    res.json({donation: entity, key: process.env.RZP_KEY_ID})
                    console.log("????")
                }
            });

        }
    });
});



router.post("/donate/verify", (req, res)=>{
    console.log(req.body)

    var hmac = crypto.createHmac('sha256', process.env.RZP_KEY_SECRET);
    hmac.update(req.body.response.razorpay_order_id+"|"+req.body.response.razorpay_payment_id);

    var generated_signature = hmac.digest("hex");
    if(generated_signature==req.body.response.razorpay_signature){
        Donation.findOneAndUpdate({orderId : req.body.order_id}, {completed: true}, (err, donation)=>{
            donation.save((error)=>{
                if(error){
                    req.flash("error", "We are unable to verify your donation. Please contact us ASAP at the number mentioned below, or via email")
                    res.redirect("/contact")
                }else{
                    Donation.findOne({orderId: req.body.order_id}, (err, donation)=>{
                        if(err || donation.length == 0){
                            req.flash("error", "We are unable to verify your donation, please contact us on our email if you think this is in error");
                            res.redirect("/donate")
                        }
                            else{
                                res.send("verified")
                            }
                        })
                }
            })
        })
        
        }
            else{
                req.flash("error", "We are unable to verify your donation, please contact us on our mail if you think this is in error");
                res.redirect("/donate")
        }
})  
router.get("/thankyou/:id", (req, res)=>{
    Donation.findOne({orderId:req.params.id, completed: true}, (err, donation)=>{
        if(err || donation.length == 0){
            req.flash("error", "We are unable to find your donation, please contact us on our mail if you think this is in error")
            res.redirect("/donate")
        }
        else{
            res.render("thankyou.ejs", {donation: donation, page: ["Donations","Thank you, "+donation.name]});
        }
    })
});



module.exports = router;