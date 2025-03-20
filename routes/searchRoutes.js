const express=require("express");
const { isLogined } = require("../utils/middlewares");
const { wrapAsync } = require("../utils/utils");
const axios = require("axios");
const ExpressError=require("../utils/ExpressError");
const userModel = require("../models/userModel");
const router=express.Router();

router.get('/', isLogined ,wrapAsync(async (req, res,next) => {
    let { q, type="track", market, limit = 20, offset = 0, include_external="audio" } = req.query;
    // console.log(req.query)
    type=type+(req.query.artist ? ",artist" : "")+(req.query.album ? ",album" : "")+(req.query.playlist ? ",playlist" : "")
    // console.log(type)
    const headers = { 'Authorization': `Bearer ${req.session.accessToken}` }; // Construct query parameters
    const params = { q, type, market, limit, offset, include_external };
    try { const response = await axios.get('https://api.spotify.com/v1/search', { headers, params });
    // console.log(response.data.playlists.items[0].images[0].url);    
    res.render("searchResult.ejs",{albums:response.data.albums, playlists: response.data.playlists, artists:response.data.artists, tracks:response.data.tracks}) 
    // res.json(response.data)
}
    catch (error) {
        return next(new ExpressError(400,"Bad request"));
    }
}));

router.post("/api/auth",(req,res,next)=>{   
    let model=userModel(req.body)
})

module.exports=router;