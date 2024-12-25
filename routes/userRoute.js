const express=require("express");
const { isLogined } = require("../utils/middlewares");
const { wrapAsync } = require("../utils/utils");
const axios = require("axios");
const ExpressError = require("../utils/utils");
const router=express.Router();

router.route("/:user_id")
.get(isLogined,wrapAsync(async(req,res,next)=>{
    let {user_id}=req.params;
    let headers={ "Authorization":`Bearer ${req.session.accessToken}` }
    let result=await axios.get(`https://api.spotify.com/v1/users/${user_id}`, {headers});
    res.send(result.data);
}));

router.route("/:user_id/playlists")
.get(isLogined,wrapAsync(async(req,res,next)=>{
    let {user_id}=req.params;
    let {limit=10,offset=0}=req.query;
    let headers={ "Authorization":`Bearer ${req.session.accessToken}` }
    let result=await axios.get(`https://api.spotify.com/v1/users/${user_id}/playlists?limit=${limit}&offset=${offset}`, {headers});
    res.json(result.data);
}))
.post(isLogined,wrapAsync(async(req,res,next)=>{
    let {user_id}=req.params;
    let headers={ "Authorization":`Bearer ${req.session.accessToken}` }
    //req.body will contain name,public:boolean,collaborative:boolean,description
    let result=await axios.post(`https://api.spotify.com/v1/users/${user_id}/playlists`,req.body, {headers});
}))
module.exports=router;