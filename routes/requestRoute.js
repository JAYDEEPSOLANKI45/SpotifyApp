const express=require("express");
const { isLogined } = require("../utils/middlewares");
const { wrapAsync } = require("../utils/utils");
const axios = require("axios");
const ExpressError=require("../utils/ExpressError");
const router=express.Router();
const User=require("../models/userModel");
const Request=require("../models/requestModel");

router.route("/")
//TODO: make it post and put user_id and type into request body
.get(isLogined,wrapAsync(async(req,res,next)=>{
    let {user_id,type}=req.query;
    if(!type || !(type==="friend" || type==="group"))
        return res.status(400).json({message:"Check the request type and try again"});
    //me
    let user=await User.findOne({username:req.session.accountId});
    if (!user) { return res.status(400).json({message:"Login with the valid credentials first"}) }
    //the other person
    let requestUser=await User.findOne({username:user_id});
    if (!requestUser) { return res.status(400).json({message:"The user does not exist"}) }
    let request=new Request({from:user._id,to:requestUser._id,type:type})
    let savedRequest=await request.save();
    user.outgoingRequests.push(savedRequest._id);
    console.log(user);
}))


//incoming
router.route("/incoming")
.get(isLogined,wrapAsync(async(req,res,next)=>{
    let user=await User.findOne({username:req.session.accountId});
    if (!user) { return res.status(400).json({message:"Login with the valid credentials first"}) }
    //the other person
    let request=await Request.find({to:user._id}).populate("from").populate("to");
    res.status(200).json(request);
}))

module.exports=router;