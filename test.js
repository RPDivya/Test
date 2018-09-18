
var RuleEngine= require('node-rules'); 
var cron =require('node-cron');
var MongoClient = require('mongodb').MongoClient;
var each =require('foreach');
var dateTime = require('node-datetime');
var nodemailer = require('nodemailer');
var dt = dateTime.create();
var today = dt.format('d-m-Y');


cron.schedule('*/4  * * * * *',()=>{

var R=new RuleEngine();

 MongoClient.connect('mongodb://localhost:27017/public', { useNewUrlParser: true }, function(req,res){
     var dbname=res.db('public');
     dbname.collection('member').find({"update":{$gte:2}}).toArray(function(err,result){
         if(err){ throw err;}
         each(result,function(value, key, object){
            
         var fact={
            "name":value.name,
             "date":value.date,
             "update":value.update
         };

         var rule={
            "condition":function(R){
            R.when(this.update > 2);
           
            },
            "consequence":function(R){
                this.result = false;
                this.reason = "Failed";
                 R.stop();
            }
        };
        
        R.register(rule);
        
        R.execute(fact, function(data){
            console.log(data);
            if(data.result){
                console.log("SUCCESS");
                sendmail(data.name);

            }else{
                console.log("RETRY");
            }
             });

         });

 });

 });


});




function sendmail(name){

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'divya@gmail.com',
        pass: 'test'
      }
    });
    
    var mailOptions = {
      from: 'divya@gmail.com',
     to: 'divya.r1@photoninfotech.net',
      subject: 'Congrats ',
     html: '<h1>Hi '+name+'.....</h1><p>TEST</p>',
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    }); 


}