const express=require("express");
const { isLogined } = require("../utils/middlewares");
const { wrapAsync } = require("../utils/utils");
const axios = require("axios");
const ExpressError = require("../utils/utils");
const router=express.Router();

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
}))

router.route("/:playlist_id/tracks")
.get(isLogined,wrapAsync(async(req,res,next)=>{
    let {playlist_id}=req.params;
    //add fields
    let {limit=10,offset=0}=req.query;
    let headers={ "Authorization":`Bearer ${req.session.accessToken}` }
    let result=await axios.get(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks?limit=${limit}&offset=${offset}`,{headers});
    res.json(result);
}))

module.exports=router;