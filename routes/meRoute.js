const express=require("express");
const { isLogined } = require("../utils/middlewares");
const { wrapAsync } = require("../utils/utils");
const axios = require("axios");
const ExpressError = require("../utils/utils");
const router=express.Router();

router.route("/")
.get(isLogined, wrapAsync( async (req, res,next) => {
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

router.route("/playlists")
.get(isLogined,wrapAsync(async(req,res,next)=>{
    let {limit=10,offset=0}=req.query;
    let headers={"Authorization":`Bearer ${req.session.accessToken}`};
    let result=await axios.get(`https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`,{headers});
    res.json(result.data);
}))

router.route("/top/:type")
.get(isLogined, wrapAsync(async (req, res, next) => {
    let { limit=5, offset=0 }=req.query;
    let {type} = req.params;
    console.log(type);
    if(!(type=='tracks' || type=='artists'))
        return next(new ExpressError(400,"Not a valid type"));
    const accessToken = req.session.accessToken;
    const headers = { 'Authorization': `Bearer ${accessToken}`};
    try {
        const response = await axios.get(`https://api.spotify.com/v1/me/top/${type}?limit=${limit}&offset=${offset}`, { headers });
        res.json(response.data.items);
    } catch (error) {
        console.log(error)
        return next(new ExpressError(400,"Bad request"));
    }
}));

module.exports=router;