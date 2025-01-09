const express=require("express");
const { isLogined } = require("../utils/middlewares");
const { wrapAsync } = require("../utils/utils");
const axios = require("axios");
const ExpressError=require("../utils/ExpressError");
const router=express.Router();
const User=require("../models/userModel");
const Group=require("../models/groupModel");

router.route("/")
.get(isLogined, wrapAsync( async (req, res,next) => {
    const accessToken = req.session.accessToken;
    const headers = { 'Authorization': `Bearer ${accessToken}` };
    try {
        const response = await axios.get('https://api.spotify.com/v1/me', { headers });
        let playlist=await axios.get(`https://api.spotify.com/v1/me/playlists`,{headers});
        let savedAlbums=await axios.get(`https://api.spotify.com/v1/me/albums`,{headers});
        let topTracks=await axios.get(`https://api.spotify.com/v1/me/top/tracks`, {headers});
        let topArtists=await axios.get(`https://api.spotify.com/v1/me/top/artists`, {headers});

        res.render("profile.ejs",{user:response.data, playlists:playlist.data, topTracks:topTracks.data, topArtists:topArtists.data, savedAlbums:savedAlbums.data, currentUser:res.locals.currentUser});
    } catch (error) {
        console.error('Error:', error.message);
        if (error) {
            return next(new ExpressError(400,"Bad request"));
        }
    }
}));

router.route("/browse")
.get(isLogined, wrapAsync( async (req, res,next) => {
    const accessToken = req.session.accessToken;
    const headers = { 'Authorization': `Bearer ${accessToken}` };
    try {
        let headers={"Authorization":`Bearer ${req.session.accessToken}`};
        let newReleases=await axios.get(`https://api.spotify.com/v1/browse/new-releases`,{headers});
        let categories=await axios.get(`https://api.spotify.com/v1/browse/categories`,{headers}); 
        res.render("explore.ejs",{newReleases:newReleases.data,categories:categories.data});
    } catch (error) {
        console.error('Error:', error.message);
        if (error) {
            return next(new ExpressError(400,"Bad request"));
        }
    }
}));


module.exports=router;