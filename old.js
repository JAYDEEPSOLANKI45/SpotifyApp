const express=require("express");
const app=express();
const session=require("express-session");
const qs=require("qs");
const dotenv=require("dotenv");
dotenv.config();
const queryString=require("querystring");
const axios=require("axios");

app.use(session({
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        maxAge:24*3600*1000,
        httpOnly:true
    },
    //online sesion store mongoStore
}));
app.use(express.urlencoded({extended:true}));

app.get("/login",async(req,res)=>{
    const scope = 'user-read-private user-read-email user-library-read playlist-read-private user-top-read';
    res.redirect('https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + process.env.CLIENT_ID +
        '&scope=' + encodeURIComponent(scope) +
        '&redirect_uri=' + encodeURIComponent(process.env.REDIRECT_URL));
});

app.get("/",async (req,res)=>{
    if(!req.query.code)
        return res.send("no auth code found")
    req.session.authCode=req.query.code;
    //get Token

    const data=qs.stringify({
        grant_type:"authorization_code",
        code:`${req.session.authCode}`,
        redirect_uri:process.env.REDIRECT_URL
    })

    //basic for the authcode based authorization and bearer for the accesstoken based authorization
    const headers={
        'content-type':"application/x-www-form-urlencoded",
        "Authorization":"Basic "+ Buffer.from(process.env.CLIENT_ID+":"+process.env.CLIENT_SECRET).toString('base64')
    }
    const result=await axios.post("https://accounts.spotify.com/api/token",data,{headers})
    console.log(result);
})

app.listen(8080,(req,res)=>{
    console.log("listening");
})