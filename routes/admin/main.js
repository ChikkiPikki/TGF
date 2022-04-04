var router = require("express").Router({mergeParams: true});
var auth = require("../commonFunctions/auth.js");
var passport = require("passport");
var Meta = require("../../models/Meta.js")
var Donation = require("../../models/Donation.js")
var Event = require("../../models/Event.js")
var Volunteer = require("../../models/Volunteer.js")
const excel = require("exceljs");

router.get("/login", (req, res)=>{
	res.render("adminLogin.ejs", {page: ["Admin", "Login"]});
})

router.post("/login", passport.authenticate('local', {failureRedirect:'/login', successRedirect: '/admin'}), (req, res)=>{

});

router.get("/admin", auth, (req, res)=>{
    res.render("admin/home.ejs", {page: ["Admin", "Dashboard"]});
});
router.get("/admin/meta/:name", auth, (req, res)=>{
	Meta.findOne({name: req.params.name}, (err, entries)=>{
		if(err){
			req.flash("error", "Database error: "+error.message+". Please try again later")
			res.redirect("back")
		}else{
			res.render("admin/meta.ejs", {meta: entries})
		}
	})
});
router.post("/admin/meta/:name", auth, (req, res)=>{
	Meta.findOneAndUpdate({name: req.params.name}, {value: req.body.number}, (err, entry)=>{
		if(err){
			req.flash("error", "Database error: "+error.message+". Please try again later")
			res.redirect("back")
		}else{
			req.flash("message", "Meta "+req.params.name+" updated.")
			res.redirect("/admin")
		}
	})
})

router.get("/admin/generate-site-report", auth,(req, res)=>{
	var approve = {
				true: "Yes",
				false: "No",
				undefined: "No",
				"Yes": "Yes",
				"No": "No"
			}
	let workbook = new excel.Workbook();
	let volunteers = workbook.addWorksheet("Volunteers")
	let donations = workbook.addWorksheet("Donations")
	let events = workbook.addWorksheet("Events")

	volunteers.columns = [
		{header: "Number", key: "number", width: 7},
		{header: "Name", key: "name", width: 25},
		{header: "Date", key: "date", width: 15},
		{header: "Approved", key: "approved", width: 15},
		{header: "Role", key: "role", width: 15},
		{header:"Participation", key: "role", width: 15},
		{header: "Events", key: "events", width: 15}
	]
	donations.columns = [
		{header: "Number", key: "number", width: 7},
		{header: "From", key: "from", width: 25},
		{header: "Amount", key:"amount", width: 25},
		{header: "Date", key: "date", width: 15},
		{header: "Contact-number", key: "number", width: 20},
		{header: "Contact-email", key: "email", width: 30},
		{header: "Utilised", key: "Utilised", width: 20}
	]
	events.columns = [
		{header: "Number", key: "number", width: 7},
		{header: "Name", key: "name", width: 25},
		{header: "Date", key: "date", width: 30},
		{header: "Donation-total", key: "donation-total", width: 25},
		{header: "Donors", width: 30},
		{header: "Published", key: "published", width: 15}
	]
	
	Volunteer.find({}, (err, vols)=>{
		if(err){
			req.flash("error", "Database error.")
			res.redirect("back")
		}else{
			
			vols.forEach((volunteer, inde)=>{
				volunteers.addRow([inde+1, volunteer.name, dateConvert(volunteer.date), approve[volunteer.approved], volunteer.role, volunteer.events.length, volunteer.events[0].name])
				volunteer.events.slice(1,).forEach((ev, index)=>{
						volunteers.addRow(["\'\'","\'\'","\'\'","\'\'","\'\'","\'\'",ev.name])						
				})
			})
			Event.find({}, (err, eves)=>{
				if(err){
					req.flash("error", "Database error.")
					res.redirect("back")
				}else{
					eves.forEach((event, num)=>{
						var tot=0 
						event.donations.forEach(function(donation){tot=tot+Number(donation.amount/100)});
						if(event.donations.length>0){
							events.addRow([num+1, event.name, dateConvert(event.date), tot, event.donations[0].name+"-"+String(event.donations[0].amount/100)+"-"+String(event.donations[0].phone), approve[event.published]])
							event.donations.slice(1,).forEach((doo, numu)=>{
								evets.addRow("\'\'","\'\'","\'\'","\'\'", event.doo.name+"-"+String(event.doo.amount/100)+"-"+String(event.doo.phone),"\'\'")
							})						
						}else{
							events.addRow([num+1, event.name, dateConvert(event.date), tot, "...", approve[event.published]])
						}
					})
					Donation.find({}, (err, dons)=>{
						if(err){
							req.flash("Database error.")
							res.redirect("back")
						}else{
							dons.forEach(function(don, numuu){
								donations.addRow([numuu+1,don.name, don.amount/100, dateConvert(don.date), don.phone, don.email, approve[don.utilised]])
							})
							res.setHeader(
							  "Content-Type",
							  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
							);
							var today = new Date()
							res.setHeader(
							  "Content-Disposition",
							  "attachment; filename=" + "Site Report "+dateConvert(today)+".xlsx"
							);
							return workbook.xlsx.write(res).then(function () {
							  res.status(200).end();
							});
						}
					})
				}
			})
		}
	})
	
})
var eveCollect = function(e){
	var temp = ""
	e.forEach((eve)=>{
		temp = temp+(eve.name)+", "
	})
	return temp
}
var dateConvert = function(date){
	return String(date.getDate())+"-"+String(date.getMonth()+1)+"-"+String(date.getFullYear())
} 
var sum = function(arr){
	var total = 0;
	for (var i in arr) {
	  total += arr[i];
	}
	return total
}
module.exports= router;