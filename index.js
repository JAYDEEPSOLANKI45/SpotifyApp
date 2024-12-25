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
const { wrapAsync, ExpressError } = require('./utils/utils');

//routes
const meRouter=require("./routes/meRoute");
const userRoute=require("./routes/userRoute");
const playlistRoute=require("./routes/playlistRoute");
const albumRoute=require("./routes/albumRoute");
const browseRoute=require("./routes/browseRoute");
const artistRoute=require("./routes/artistRoute");

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

app.get("/home",(req,res)=>{
    res.send("home");
})
// Route to redirect user to Spotify authorization page with scopes
app.get('/login',saveRedirectUrl, (req, res) => {
    const scope = `
        user-read-private
        user-read-email
        user-library-read
        user-library-modify
        playlist-read-private
        playlist-read-collaborative
        playlist-modify-public
        playlist-modify-private
        user-top-read
        user-read-recently-played
        user-follow-read
        user-follow-modify
        app-remote-control
        streaming
        user-read-playback-state
        user-modify-playback-state
        user-read-currently-playing
        user-read-playback-position
        ugc-image-upload
        `.replace(/\s+/g, ' ').trim();

    res.redirect('https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + process.env.CLIENT_ID +
        '&scope=' + encodeURIComponent(scope) +
        '&redirect_uri=' + encodeURIComponent(process.env.REDIRECT_URL));

});

app.get('/login/code', wrapAsync(async (req, res) => {
    req.session.authorizationCode = req.query.code;
    const data = qs.stringify({
        code: req.query.code,
        redirect_uri: process.env.REDIRECT_URL,
        grant_type: 'authorization_code'
    });
    const headers = {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64')
    };

    try {
        const result = await axios.post("https://accounts.spotify.com/api/token", data, { headers });
        const accessToken = result.data.access_token;
        req.session.accessToken = accessToken;
        let redirectUrl= req.session.redirectUrl || "home";
        delete req.session.redirect;
        console.log(redirectUrl);
        res.redirect(redirectUrl);
    } catch (error) {
        return next(new ExpressError(400,"Bad request"));
    }
}));


app.use("/me", meRouter);
app.use("/users", userRoute);
app.use("/playlists",playlistRoute);
app.use("/albums",albumRoute);
app.use("/browse",browseRoute);
app.use("/artists",artistRoute);

// app.get("/error",(req,res)=>{
//     res.send("error");
// });

// app.use((err,req,res,next)=>{
//     let {status=500,message="Something broke!"}=err;
//     res.redirect("/error");
// });

app.listen(8080, () => {
    console.log('Listening on port 8080');
});
