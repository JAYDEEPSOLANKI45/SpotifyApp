const express = require('express');
const app = express();
const session = require('express-session');
const dotenv = require('dotenv');
const axios = require('axios');
const mongoStore=require("connect-mongo");
const qs = require('qs'); // To format data for x-www-form-urlencoded
const mongoose=require("mongoose");
const { existsAccessToken, isLogined, saveRedirectUrl } = require('./utils/middlewares');
const { wrapAsync } = require('./utils/utils');
const ExpressError = require('./utils/utils');
dotenv.config();

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
        maxAge: 24 * 3600 * 1000,
        httpOnly: true
    },
    store:mongoStore.create({
        crypto:process.env.SECRET,
        mongoUrl:process.env.MONGODB_URI,
        touchAfter:24*3600
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

app.get('/', wrapAsync(async (req, res) => {
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
        console.log(req.session.accessToken);
        let redirectUrl= req.session.redirectUrl || "home";
        delete req.session.redirect;
        console.log(redirectUrl);
        res.redirect(redirectUrl);
    } catch (error) {
        return next(new ExpressError(400,"Bad request"));
    }
}));

// Route to show account information
app.get('/me',isLogined, wrapAsync( async (req, res) => {
    const accessToken = req.session.accessToken;
    const headers = { 'Authorization': `Bearer ${accessToken}` };
    try {
        const response = await axios.get('https://api.spotify.com/v1/me', { headers });
        res.json(response.data);
    } catch (error) {
        console.error('Error:', error.message);
        if (error) {
            return next(new ExpressError(400,"Bad request"));
        }
    }
}));

//limit
app.get('/me/top-tracks', isLogined, wrapAsync(async (req, res) => {
    let { limit=5 }=req.query;
    const accessToken = req.session.accessToken;
    const headers = { 'Authorization': `Bearer ${accessToken}` };

    try {
        const response = await axios.get(`https://api.spotify.com/v1/me/top/tracks?limit=${limit}`, { headers });
        console.log('Top 5 Tracks:', response.data.items);
        res.json(response.data.items);
    } catch (error) {
        console.log(error)
        return next(new ExpressError(400,"Bad request"));
    }
}));

app.get("/error",(req,res)=>{
    res.send("error");
});

app.use((err,req,res,next)=>{
    let {status=500,message="Something broke!"}=err;
    res.redirect("/error");
})

app.listen(8080, () => {
    console.log('Listening on port 8080');
});
