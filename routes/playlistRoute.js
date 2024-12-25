const express=require("express");
const { isLogined } = require("../utils/middlewares");
const { wrapAsync } = require("../utils/utils");
const axios = require("axios");
const ExpressError = require("../utils/utils");
const router=express.Router();


router.route("/:playlist_id/images")
.get(isLogined,wrapAsync(async(req,res,next)=>{
    let {playlist_id}=req.params;
    let headers={"Authorization":`Bearer ${req.session.accessToken}`};
    let result=await axios.get(`https://api.spotify.com/v1/playlists/${playlist_id}/images`,{headers});
    res.json(result.data);
}))
.put(isLogined,wrapAsync(async (req,res,next)=>{
    if(!req.body)
        return next(new ExpressError(400,"Bad request"));
    let {playlist_id}=req.params;
    let headers={"Authorization":`Bearer ${req.session.accessToken}`};
    //req.body should be Base64 encoded JPEG image data, maximum payload size is 256 KB.
    let result=await axios.post(`https://api.spotify.com/v1/playlists/${playlist_id}/images`,req.body,{headers});
    res.json(result.data);
}))

router.route("/:playlist_id")
.get(isLogined, wrapAsync(async(req,res,next)=>{
    let {playlist_id}=req.params;
    let headers={ "Authorization":`Bearer ${req.session.accessToken}` }
    let result=await axios.get(`https://api.spotify.com/v1/playlists/${playlist_id}`,{ headers });
    res.json(result.data);
}))
.put(isLogined,wrapAsync(async(req,res,next)=>{
    let {playlist_id}=req.params;
    let headers={"Authorization":`Bearer ${req.session.accessToken}`};
    //only provide edit page if the user is owner
    //send all the info from front end (name,public,collaborative,description)
    let result=await axios.put(`https://api.spotify.com/v1/playlists/${playlist_id}`,req.body,{headers});
    res.json(result);
}));


router.route("/:playlist_id/tracks")
.get(isLogined,wrapAsync(async(req,res,next)=>{
    let {playlist_id}=req.params;
    //add fields
    let {limit=10,offset=0}=req.query;
    let headers={ "Authorization":`Bearer ${req.session.accessToken}` }
    let result=await axios.get(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks?limit=${limit}&offset=${offset}`,{headers});
    res.json(result);
}))
.post(isLogined,wrapAsync(async(req,res,next)=>{
    //handle otherwise in frontend
    if(!req.body)
        return next(new ExpressError(400,"Bad request"));
    let {playlist_id}=req.params;
    let headers={"Authorization":`Bearer ${req.session.accessToken}`};
    //req.body contains A JSON array of the Spotify URIs
    let result=await axios.post(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,req.body,{headers});
    res.json(result);
}))
.delete(isLogined,wrapAsync(async(req,res,next)=>{
    if(!req.body)
        return next(new ExpressError(400,"Bad request"));
    let {playlist_id}=req.params;
    //req.body contains A JSON array of the Spotify URIs
    let headers={"Authorization":`Bearer ${req.session.accessToken}`};
}));
module.exports=router;