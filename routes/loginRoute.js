const express=require("express");
const { isLogined, saveRedirectUrl } = require("../utils/middlewares");
const { wrapAsync } = require("../utils/utils");
const axios = require("axios");
const ExpressError=require("../utils/ExpressError");
const qs = require("qs");
const User = require("../models/userModel");
const router=express.Router();


// Route to redirect user to Spotify authorization page with scopes
router.get('/',saveRedirectUrl, (req, res) => {
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

router.get('/code', wrapAsync(async (req, res,next) => {
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

        const meHeaders = { "Authorization": `Bearer ${accessToken}` };
        const me=await axios.get("https://api.spotify.com/v1/me",{headers:meHeaders});
        const following=await axios.get("https://api.spotify.com/v1/me/following?type=artist",{headers:meHeaders});
        console.log("Hey");
        console.log(following.data.artists.items);
        const user=await User.find({username:me.data.id});
        if(user.length==0)
        {
            console.log("Hey");
            const newUser=await User({username:me.data.id,name:me.data.display_name,email:me.data.email,url:me.data.href});
            await newUser.save();
            console.log("user saved");
        }
        console.log(user);
        console.log(redirectUrl);
        res.redirect(redirectUrl);
    } catch (error) {
        return next(new ExpressError(400,"Bad request"));
    }
}));

module.exports=router;