var express=require('express')
const session = require("express-session");
var app=express()

app.use(session({
    secret: "amar",
    saveUninitialized: true,
    resave: true
}));
var mysql=require('mysql')
var con=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"mydb"
})
con.connect()


app.set('view engine','ejs')


app.get('/',function(req,res){
    res.render('home')
})
app.get('/about',function(req,res){
    res.render('about')
})
app.get('/contact',function(req,res){
    res.render('contact')
})
app.get('/createaccount',function(req,res){
    if(req.query.submit)
        {
            var p=req.query.p
            var n=req.query.n
            var pass=req.query.pass
            var e=req.query.e
            var ph=req.query.ph
            var g=req.query.g
            var ci=req.query.ci
            var st=req.query.st
            var c=req.query.c
            var a=req.query.a
        
            con.query("select * from account",function(err,result){
    
                if(!err)
                {
                    var ac="SBI"
                    var x=result.length;
                    if(x>0)
                    {
                        x=x+101
                        ac=ac+x.toString()
                    }
                    else
                    ac="SBI101"
    con.query(`insert into account values('${ac}','${p}','${n}','${pass}','${e}','${ph}','${g}','${ci}','${st}','${c}','${a}')`,function(err,result){
    if(!err)
        res.render('createaccount',{msg:"Account created successfully with account number "+ac})
    else
    res.send("Errpr to create account"+err)
    })
                }
                else
                res.send("Error to fertch account "+err)
            })
    
            /*con.query(`INSERT INTO account(pin, name, password, email, phone, amount, city, state, c) VALUES('${p}' , '${n}', '${pass}, ${e} , '${ph}', '${a}','${ci}, ${s}, ${c}')`,function(err,result){
                if(err) throw err
                console.log("1 record inserted")
            })*/
        }
        else
            res.render('createaccount',{msg:""})
    })

app.get('/fundtransfer',function(req,res){

    if(req.session.acc)
        {
       console.log(req.session.acc)
       if(req.query.submit)
       {
           var amount=req.query.amo
           var act=req.query.act

         con.query(`select * from account where acno='${req.session.acc}'`,function(err,result){

           var camt=parseInt(result[0].amount)
           if(camt>amount)
       
           {

            con.query(`select * from account where acno='${act}'`,function(err,result){

                if(err)
                    res.send("Error to fetch Benit account account "+err)
                else
                {
                    if(result.length>0)
                    {
                    var tamt=parseInt(result[0].amount)
                    tamt=tamt+parseInt(amount)
                    camt=camt-amount
                    con.query(`update account set amount='${camt}' where acno='${req.session.acc}'`,function(err,result){
                        con.query(`update account set amount='${tamt}' where acno='${req.session.acc}'`,function(err,result){
     
                            res.render('fundtransfer',{name:req.session.name,msg:"After  withdrawal your account balance is "+tamt})
                        })
                    })
                  
                }
                else
                res.render('fundtransfer',{msg:"Invalid Benificary Account"})

                }
    

            })
           }
           else
            res.render('fundtransfer',{msg:"insufficient funds"})
           
           }) 
       }

                   else
                    res.render('fundtransfer',{name:req.session.name,msg:""})
   }
   else
      res.redirect("/login")

})
     

    


 


app.get('/withdraw',function(req,res){
    if(req.session.acc)
         {
        console.log(req.session.acc)
        if(req.query.submit)
        {
            var amount=req.query.amo
          con.query(`select * from account where acno='${req.session.acc}'`,function(err,result){

            var tamt=parseInt(result[0].amount)
            if(tamt>parseInt(amount))
        
            {
                tamt=tamt-parseInt(amount)
                con.query(`update account set amount='${tamt}' where acno='${req.session.acc}'`,function(err,result){

                    res.render('withdraw',{name:req.session.name,msg:"After  withdrawal your account balance is "+tamt})
                })
            }
            else
             res.render('deposit',{msg:"insufficient funds"})
            
            }) 
        }

                    else
                     res.render('withdraw',{name:req.session.name,msg:""})
    }
    else
       res.redirect("/login")
})
app.get('/deposit',function(req,res){
    if(req.session.acc)
        {
       console.log(req.session.acc)
       if(req.query.submit)
       {
           var amount=parseInt(req.query.amo)
         con.query(`select * from account where acno='${req.session.acc}'`,function(err,result){

           var tamt=parseInt(result[0].amount)
        if(amount>0)
       
           {
               tamt=tamt+amount
               con.query(`update account set amount='${tamt}' where acno='${req.session.acc}'`,function(err,result){

                   res.render('deposit',{name:req.session.name,msg:"After  deposit your account balance is "+tamt})
               })
           }
           else
           res.render('deposit',{msg:"insufficient funds"})

           }) 
       }

       else

   
                  res.render('deposit',{name:req.session.name,msg:""})
   }
   else
      res.redirect("/login")
})







app.get('/balancecheck',function(req,res){
    if(req.session.acc)
    {
        if(req.query.submit)
        {
            
            con.query(`select * from account where acno='${req.session.acc}'`,function(err,result){
                var t=parseInt(result[0].amount)
                res.render('balancecheck',{name:req.session.name,msg:"Your current balance is "+t})
                    })
                    }
                    else
                    res.render('balancecheck',{name:req.session.name,msg:""})
                }
                else
                res.redirect("/login")
})


app.get('/pinchanged',function(req,res){

 if(req.session.acc)
    {
    res.render('pinchanged')
    }
    else
    res.redirect("/login")
})
app.get('/accountsummary',function(req,res){
    if(req.session.acc)
        {
        res.render('accountsummary')
        }
        else
        res.redirect("/login")
})
app.get('/login',function(req,res){
    if(req.query.submit){
        var acc=req.query.acc
        var pin=req.query.pin
        con.query(`select * from account where acno='${acc}' and pin='${pin}'`,function(err,result){
            if(!err)
                if(result.length>0)
                {
                     req.session.acc=acc
                    req.session.name=result[0].name;
                    req.session.amount=result[0].amount;
                    

                   req.session.save(); 
                    
                    res.redirect("/")
                }
                    else
                res.render('login',{msg:"Invalid Account or Pin"})
                else
            res.send("Error to check login "+err)
        })

}
    else
    res.render('login',{msg:""})
})







.listen(9000)