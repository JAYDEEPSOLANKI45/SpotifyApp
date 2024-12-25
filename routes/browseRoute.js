const express=require("express");
const { isLogined } = require("../utils/middlewares");
const { wrapAsync } = require("../utils/utils");
const axios = require("axios");
const ExpressError = require("../utils/utils");
const router=express.Router();

router.route("/new-releases")
.get(isLogined,wrapAsync(async(req,res,next)=>{
        let headers={"Authorization":`Bearer ${req.session.accessToken}`};
        let result=await axios.get(`https://api.spotify.com/v1/browse/new-releases`,{headers});
        res.json(result.data);
}));

module.exports=router;