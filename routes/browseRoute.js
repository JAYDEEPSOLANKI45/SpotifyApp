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

router.route("/categories")
.get(isLogined,wrapAsync(async(req,res,next)=>{
        let headers={"Authorization":`Bearer ${req.session.accessToken}`};
        let result=await axios.get(`https://api.spotify.com/v1/browse/categories`,{headers});
        res.json(result.data);
}));

//send get to href in response and send token as a header
router.route("/categories/:category_id")
.get(isLogined,wrapAsync(async(req,res,next)=>{
        let {category_id}=req.params;
        let headers={"Authorization":`Bearer ${req.session.accessToken}`};
        let result=await axios.get(`https://api.spotify.com/v1/browse/categories/${category_id}`,{headers});
        res.json(result.data);
}));

router.route("/search")
.get(isLogined,wrapAsync(async(req,res,next)=>{
        //TODO-server side validation
        let {q,type,limit=10,offset=0}=req.query;
        let headers={"Authorization":`Bearer ${req.session.accessToken}`};
        let result=await axios.get(`https://api.spotify.com/v1/search?q=${q}&type=${type}&limit=${limit}&offset=${offset}`,{headers});
        res.json(result.data);
}))

module.exports=router;