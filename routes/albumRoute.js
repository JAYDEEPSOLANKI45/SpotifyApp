const express=require("express");
const { isLogined } = require("../utils/middlewares");
const { wrapAsync } = require("../utils/utils");
const axios = require("axios");
const ExpressError = require("../utils/utils");
const router=express.Router();

//multiple albums
router.route("/")
.get(isLogined,wrapAsync(async(req,res,next)=>{
    let {ids}=req.query;
    console.log(ids);
    let headers={"Authorization":`Bearer ${req.session.accessToken}`};
    let result=await axios.get(`https://api.spotify.com/v1/albums?ids=${ids}`,{headers});
    res.json(result.data);
}))

//for a single album
router.route("/:album_id")
.get(isLogined,wrapAsync(async(req,res,next)=>{
    let {album_id}=req.params;
    let headers={"Authorization":`Bearer ${req.session.accessToken}`};
    let result=await axios.get(`https://api.spotify.com/v1/albums/${album_id}`,{headers});
    res.json(result.data);
}));

router.route("/:album_id/tracks")
.get(isLogined,wrapAsync(async(req,res,next)=>{
    let {album_id}=req.params;
    let {limit=10,offset=0}=req.query;
    let headers={"Authorization":`Bearer ${req.session.accessToken}`};
    let result=await axios.get(`https://api.spotify.com/v1/albums/${album_id}/tracks?limit=${limit}&offset=${offset}`,{headers});
    res.json(result.data);
}))

module.exports=router;