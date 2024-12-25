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

module.exports=router;