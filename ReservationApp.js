var express = require('express');
var bodyParser = require('body-parser');
var rab_amqp = require('./routes/rab_amqp');
//const axios = require('axios');

var {mongoose} = require('./db/mongooseReservation');
var {Reservation} = require('./models/Reservation');

var app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static(__dirname+'/public'));

app.get('/home.html',(req, res) => {
    res.sendFile('/home.html');
});

app.get('/rsrv_details',(req, res) => {
    res.sendFile('/rsrv_details.html');
});
//Searching a reservation from home page
app.post('/findReservation',(req, res) => {
   var folioForSrch = req.body.folio;
   Reservation.findOne({folioNum : folioForSrch}, function(err, resultRsrv){
       if (err) {return console.log("Error fetching reservation data")}
       res.json(resultRsrv.toJSON());
   })
});
app.post('/changeStatus',(req, res) => {
    console.log("In ChangeStatus ........");
    var folioForSrch = req.body.folio;
    var newStatus = req.body.status;
    Reservation.findOne({folioNum : folioForSrch}, function(err, resultRsrv){
        if (err) {return console.log("Error fetching reservation data")}
        resultRsrv.status=newStatus;
        resultRsrv.save();
        res.json(resultRsrv.toJSON());
    });
    var rsrvStatus = {
                    folioNum: folioForSrch,
                    status: newStatus
                };
    var ForSend = JSON.stringify(rsrvStatus);
    rab_amqp.sendrsrv(ForSend,'status_q', (err,msg)=>{
        console.log("Sent the status change to InhouseApp", err, msg);  
    });
    
});
//saving newly created reservation to MongoDB database
app.post('/reservations',(req, res)=> {
     var rsrv = new Reservation({
        folioNum:req.body.folioNum,
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        address:req.body.address,
        checkinDate:req.body.checkinDate,
        checkoutDate:req.body.checkoutDate,
        ratePgm:req.body.ratePgm,
        status:req.body.status,
        notes:req.body.notes

     });
     var ForSend = JSON.stringify(rsrv);
     rsrv.save().then((result) =>{
         res.send("result is sent");
     },(e)=> {
         res.status(400).send("error sending response from server");
     });
     rab_amqp.sendrsrv(ForSend,'rsrv_q', (err,msg)=>{
        console.log("Sent the reservation to InhouseApp", err, msg);    
     });
})

app.listen(8000, ()=> {
    console.log('Server started on 8000 ...');
})