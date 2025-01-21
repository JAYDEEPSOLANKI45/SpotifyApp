const express = require('express');
const app = express();
const session = require('express-session');
const dotenv = require('dotenv');
dotenv.config();
const axios = require('axios');
const mongoStore=require("connect-mongo");
const qs = require('qs'); // To format data for x-www-form-urlencoded
const mongoose=require("mongoose");
const methodOverride=require("method-override");
app.use(methodOverride("_method"));
const { existsAccessToken, isLogined, saveRedirectUrl } = require('./utils/middlewares');
const { wrapAsync } = require('./utils/utils');
const User=require("./models/userModel");
const ExpressError=require("./utils/ExpressError");
const path=require('path');
const ejsmate=require("ejs-mate");


//routes

const meRouter=require("./routes/meRoute");
const userRoute=require("./routes/userRoute");
const playlistRoute=require("./routes/playlistRoute");
const albumRoute=require("./routes/albumRoute");
const browseRoute=require("./routes/browseRoute");
const artistRoute=require("./routes/artistRoute");
const trackRoute=require("./routes/trackRoute");
const loginRoute=require("./routes/loginRoute");
const searchRoute=require("./routes/searchRoutes");
const requestRoute=require("./routes/requestRoute");
const profileRouter=require("./routes/profile")

const passport = require('passport');
const LocalStrategy=require("passport-local");

async function main()
{
    await mongoose.connect(process.env.MONGODB_URI);
}
main().then(res=>console.log("connected")).catch(err=>console.log(err));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge:3600 * 1000,
        httpOnly: true
    },
    store:mongoStore.create({
        crypto:process.env.SECRET,
        mongoUrl:process.env.MONGODB_URI,
        touchAfter:3600
    })
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//spotify web api routes
app.use("/users", userRoute);
app.use("/playlists",playlistRoute);
app.use("/albums",albumRoute);
app.use("/browse",browseRoute);
app.use("/artists",artistRoute);
app.use("/tracks",trackRoute);
app.use("/login",loginRoute);
app.use("/search", searchRoute);
app.use("/me/requests",requestRoute);
app.use("/me", meRouter);

app.use("/profile", profileRouter);

//custom routes


//passport
app.use(passport.initialize());
app.use(passport.session());

app.engine("ejs",ejsmate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public/css")));
app.use(express.static(path.join(__dirname,"public/js")));
// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

//TODO: error handling middleware

// app.get("/error",(req,res)=>{
//     res.send("error");
// });

// app.use((err,req,res,next)=>{
//     let {status=500,message="Something broke!"}=err;
//     res.redirect("/error");
// });
app.use("/",isLogined,(req,res)=>{
    return res.redirect("/profile");
})

app.use("/logout",isLogined,wrapAsync(async(req,res,next)=>{
    delete req.session.authorizationCode;
    delete req.session.accessToken;
    res.status(200).json({message:"Logged out successfully"});
}))

app.listen(8080, () => {
    console.log('Listening on port 8080');
});
