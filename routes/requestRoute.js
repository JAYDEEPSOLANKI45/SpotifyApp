const express=require("express");
const { isLogined } = require("../utils/middlewares");
const { wrapAsync } = require("../utils/utils");
const axios = require("axios");
const ExpressError=require("../utils/ExpressError");
const router=express.Router();
const User=require("../models/userModel");
const Request=require("../models/requestModel");
const Group=require("../models/groupModel");
const mongoose=require("mongoose");

router.route("/")
//shows the pending request
.get(isLogined,wrapAsync(async(req,res,next)=>{
    let user=await User.findOne({username:req.session.accountId});
    if (!user) { return res.status(400).json({message:"Login with the valid credentials first"}) }
    let request=await Request.find({from:user._id}).populate("from","_id username name email uri genres").populate("to" ,"_id username name email uri genres");
    res.status(200).json(request);
}))
//TODO:dont let request happen from both the sides. if they try to request back, make them friends
//TODO: Also dont let anyone send friend request to anyone who is already their friend
//TODO: dont let owner request to its group
.post(isLogined,wrapAsync(async(req,res,next)=>{
    let {id,type}=req.query;
    //me
    let user=await User.findOne({username:req.session.accountId});
    if (!user) { return res.status(400).json({message:"Login with the valid credentials first"}) }
    //the other person
    if(type=="friend")
    {
        let requestUser=await User.findOne({username:id});
        if (!requestUser) { return res.status(400).json({message:"The user does not exist"}) }
        let request=new Request({from:user._id,to:requestUser._id,type:type})
        let savedRequest=await request.save();
        user.outgoingRequests.push(savedRequest._id);
        requestUser.incomingRequests.push(savedRequest._id);
        user.save();
        requestUser.save();
        res.status(200).json({message:"Friend request sent"});
    }
    else if(type=="group")
    {
        if(!mongoose.isValidObjectId(id))
            return res.status(400).json({message:"Invalid Group ID"});
        let requestGroup=await Group.findById(id);
        if(!requestGroup) return res.status(404).json({message:"The group does not exist"});
        let request=new Request({from:user._id,to:requestGroup.owner,type:type});
        let savedRequest=await request.save();
        user.outgoingRequests.push(savedRequest._id);
        let owner=await User.findById(requestGroup.owner);
        owner.incomingRequests.push(savedRequest._id);
        user.save();
        owner.save();
        res.status(200).json({message:"Group join request sent"});
    }
    else
    {
        res.status(400).json({message:"Check the request type and try again"});
    }
}))

//accept the request
//TODO: accept for the group request
//TODO: test 
.put(isLogined,wrapAsync(async(req,res,next)=>{
    let {request_id,group_id=null}=req.body;
    let user=await User.findOne({username:req.session.accountId});
    if (!user) { return res.status(400).json({message:"Login with the valid credentials first"}) }
    let request=await Request.findByIdAndDelete(request_id);
    //the other person
    let requestUser=await User.findById(request.from._id);
    if (!requestUser) { return res.status(400).json({message:"The user does not exist"}) }

    //remove the requests from both the users
    user.incomingRequests.pull(request._id);
    requestUser.outgoingRequests.pull(request._id);

    if(request.type=="friend")
    {
        //add each other into their friends list
        user.friends.push(requestUser._id);
        requestUser.friends.push(user._id);
        //save the users back
        user.save();
        requestUser.save();
        
        res.status(200).json({message:"Friend added successfully"});
    }
    else
    {
        requestUser.groups.push(group_id);
        let group=await Group.findById(group_id);
        group.members.push(requestUser._id);
        res.status(200).json({message:"Member added successfully"});
    }
}))

//TODO: test
.delete(isLogined,wrapAsync(async(req,res,next)=>{
    let {request_id}=req.body;
    let user=await User.findOne({username:req.session.accountId});
    if (!user) { return res.status(400).json({message:"Login with the valid credentials first"}) }
    //the other person
    let request=await Request.findByIdAndDelete(request_id);
    let requestUser=await User.findById(request.from._id);
    if (!requestUser) { return res.status(400).json({message:"The user does not exist"}) }
    //remove the requests from both the users
    user.incomingRequests.pull(request._id);
    requestUser.outgoingRequests.pull(request._id);
    //save the users back
    user.save();
    requestUser.save();

    res.status(200).json({message:"Request removed successfully"});
}));


//incoming
router.route("/incoming")
.get(isLogined,wrapAsync(async(req,res,next)=>{
    let user=await User.findOne({username:req.session.accountId});
    if (!user) { return res.status(400).json({message:"Login with the valid credentials first"}) }
    //the other person
    let request=await Request.find({to:user._id}).populate("from", "_id username name email uri genres").populate("to","_id username name email uri genres");
    res.status(200).json(request);
}))

module.exports=router;