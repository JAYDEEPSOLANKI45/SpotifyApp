const express=require("express");
const { isLogined } = require("../utils/middlewares");
const { wrapAsync } = require("../utils/utils");
const axios = require("axios");
const ExpressError=require("../utils/ExpressError");
const router=express.Router();

router.route("/")
.get(isLogined,wrapAsync(async(req,res,next)=>{
    //comma separated artist ids
    let {ids}=req.query;
    let headers={"Authorization":`Bearer ${req.session.accessToken}`};
    let result=await axios.get(`https://api.spotify.com/v1/artists?ids=${ids}`,{headers});
    res.json(result.data);
}))

router.route("/:artist_id")
.get(isLogined,wrapAsync(async(req,res,next)=>{
    let {artist_id}=req.params;
    let headers={"Authorization":`Bearer ${req.session.accessToken}`};
    let result=await axios.get(`https://api.spotify.com/v1/artists/${artist_id}`,{headers});
    res.json(result.data);
}))

router.route("/:artist_id/albums")
.get(isLogined,wrapAsync(async(req,res,next)=>{
    let {artist_id}=req.params;
    //can add parameters like include_groups- album,single,appears_on,compilation
    let headers={"Authorization":`Bearer ${req.session.accessToken}`};
    let result=await axios.get(`https://api.spotify.com/v1/artists/${artist_id}/albums`,{headers});
    res.json(result.data);
}))

router.route("/:artist_id/top-tracks")
.get(isLogined,wrapAsync(async(req,res,next)=>{
    let {artist_id}=req.params;
    //can add parameters like include_groups- album,single,appears_on,compilation
    let headers={"Authorization":`Bearer ${req.session.accessToken}`};
    let result=await axios.get(`https://api.spotify.com/v1/artists/${artist_id}/top-tracks`,{headers});
    res.json(result.data);
}))

//Deprecated
// router.route("/:artist_id/related-artists")
// .get(isLogined,wrapAsync(async(req,res,next)=>{
//     let {artist_id}=req.params;
//     //can add parameters like include_groups- album,single,appears_on,compilation
//     let headers={"Authorization":`Bearer ${req.session.accessToken}`};
//     let result=await axios.get(`https://api.spotify.com/v1/artists/${artist_id}/related-artists`,{headers});
//     res.json(result.data);
// }))


module.exports=router;