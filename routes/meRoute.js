const express=require("express");
const { isLogined } = require("../utils/middlewares");
const { wrapAsync } = require("../utils/utils");
const axios = require("axios");
const ExpressError=require("../utils/ExpressError");
const router=express.Router();
const User=require("../models/userModel");
const Group=require("../models/groupModel");

router.route("/")
.get(isLogined, wrapAsync( async (req, res,next) => {
    const accessToken = req.session.accessToken;
    const headers = { 'Authorization': `Bearer ${accessToken}` };
    try {
        const response = await axios.get('https://api.spotify.com/v1/me', { headers });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error:', error.message);
        if (error) {
            return next(new ExpressError(400,"Bad request"));
        }
    }
}));

router.route("/playlists")
.get(isLogined,wrapAsync(async(req,res,next)=>{
    let {limit=10,offset=0}=req.query;
    let headers={"Authorization":`Bearer ${req.session.accessToken}`};
    let result=await axios.get(`https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`,{headers});
    res.json(result.data);
}));

router.route("/albums")
.get(isLogined,wrapAsync(async(req,res,next)=>{
    let {limit=10,offset=0}=req.query;
    let headers={"Authorization":`Bearer ${req.session.accessToken}`};
    let result=await axios.get(`https://api.spotify.com/v1/me/albums?limit=${limit}&offset=${offset}`,{headers});
    res.json(result.data);
}))
.put(isLogined,wrapAsync(async(req,res,next)=>{
    let headers={"Authorization":`Bearer ${req.session.accessToken}`};
    let {ids}=req.query;
    let idsArray=ids.split(",");
    let result=await axios.put(`https://api.spotify.com/v1/me/albums`,{ids:idsArray},{headers});
    res.json(result.data);
}))
.delete(isLogined,wrapAsync(async(req,res,next)=>{
    let {ids}=req.query;
    let headers={"Authorization":`Bearer ${req.session.accessToken}`};
    let idsArray=ids.split(",");
    //axios.delete takes parameteres differently than other methods
    let result=await axios.delete(`https://api.spotify.com/v1/me/albums`,{headers,data:{ids:idsArray}});
    res.json(result.data);
}));

//check if the user has saved those albums
router.route("/albums/contains")
.get(isLogined,wrapAsync(async(req,res,next)=>{
    let {ids}=req.query;
    let headers={"Authorization":`Bearer ${req.session.accessToken}`};
    let result=await axios.get(`https://api.spotify.com/v1/me/albums/contains?ids=${ids}`,{headers});
    res.json(result.data);
}));


router.route("/top/:type")
.get(isLogined, wrapAsync(async (req, res, next) => {
    let { limit=5, offset=0 }=req.query;
    let {type} = req.params;
    if(!(type=='tracks' || type=='artists'))
        return next(new ExpressError(400,"Not a valid type"));
    const accessToken = req.session.accessToken;
    const headers = { 'Authorization': `Bearer ${accessToken}`};
    try {
        const response = await axios.get(`https://api.spotify.com/v1/me/top/${type}?limit=${limit}&offset=${offset}`, { headers });
        res.json(response.data.items);
    } catch (error) {
        console.log(error)
        return next(new ExpressError(400,"Bad request"));
    }
}));

//player information create another TODO: route /me/player inside index.js
router.route("/player")
.get(isLogined,wrapAsync(async(req,res,next)=>{
    let headers={"Authorization":`Bearer ${req.session.accessToken}`};
    let result=await axios.get(`https://api.spotify.com/v1/me/player`,{headers});
    res.json(result.data);
}));

router.route("/player/devices")
.get(isLogined,wrapAsync(async(req,res,next)=>{
    let headers={"Authorization":`Bearer ${req.session.accessToken}`};
    let result=await axios.get(`https://api.spotify.com/v1/me/player/devices`,{headers});
    res.json(result.data);
}));

router.route("/player/currently-playing")
.get(isLogined,wrapAsync(async(req,res,next)=>{
    let headers={"Authorization":`Bearer ${req.session.accessToken}`};
    let result=await axios.get(`https://api.spotify.com/v1/me/player/currently-playing`,{headers});
    res.json(result.data);
}));

router.route("/player/recently-played")
.get(isLogined,wrapAsync(async(req,res,next)=>{
    let {limit=5,offset=0}=req.query;
    // let date=new Date();
    // const unixTimeStamp=date.getTime();
    let headers={"Authorization":`Bearer ${req.session.accessToken}`};
    let result=await axios.get(`https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`,{headers});
    res.json(result.data);
}));

router.route("/following/contains")
.get(isLogined,wrapAsync(async(req,res,next)=>{
    let headers={"Authorization":`Bearer ${req.session.accessToken}`};
    let {type,ids}=req.query;
    let result=await axios.get(`https://api.spotify.com/v1/me/following/contains?type=${type}&ids=${ids}`,{headers});
    res.json(result.data);
}))

router.route("/following")
.get(isLogined,wrapAsync(async(req,res,next)=>{
    let headers={"Authorization":`Bearer ${req.session.accessToken}`};
    let result=await axios.get(`https://api.spotify.com/v1/me/following?type=artist`,{headers});
    res.json(result.data);
}))
//TODO: testing to be done
.put(isLogined,wrapAsync(async(req,res,next)=>{
    let headers={"Authorization":`Bearer ${req.session.accessToken}`};
    let {type}=req.query;
    //TODO: server side validation needed
    let {ids}=req.body;
    let result=await axios.put(`https://api.spotify.com/v1/me/following?type=${type}&ids=${ids}`,{ids},{headers});
    res.json(result.data);
}))
//TODO: testing to be done
.delete(isLogined,wrapAsync(async(req,res,next)=>{
    let headers={"Authorization":`Bearer ${req.session.accessToken}`};
    let {type}=req.query;
    //TODO: server side validation needed
    let {ids}=req.body;
    let result=await axios.delete(`https://api.spotify.com/v1/me/following?type=${type}&ids=${ids}`,{headers, data:{ids}});
    res.json(result.data);
}));

//TODO: testing
//liked songs
router.route("/tracks")
.get(isLogined, wrapAsync(async (req, res, next) => {
    //limit 50
    let { limit = 20, offset = 0 } = req.query;
    let headers = { "Authorization": `Bearer ${req.session.accessToken}` };

    try {
        let result = await axios.get(`https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`, { headers });
        res.json(result.data);
    } catch (error) {
        console.error('Error fetching saved tracks:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
            return next(new ExpressError(error.response.status, error.response.data.error.message));
        } else {
            return next(new ExpressError(500, "Internal Server Error"));
        }
    }
}))
.put(isLogined, wrapAsync(async (req, res, next) => {
    let { ids } = req.body; // An array of track IDs
    let headers = { "Authorization": `Bearer ${req.session.accessToken}` };
    
    try {
        let result = await axios.put(`https://api.spotify.com/v1/me/tracks`, { ids }, { headers });
        res.json(result.data);
    } catch (error) {
        console.error('Error saving tracks:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
            return next(new ExpressError(error.response.status, error.response.data.error.message));
        } else {
            return next(new ExpressError(500, "Internal Server Error"));
        }
    }
}))
.delete(isLogined, wrapAsync(async (req, res, next) => {
    let { ids } = req.body; // An array of track IDs
    let headers = { "Authorization": `Bearer ${req.session.accessToken}` };
    
    try {
        let result = await axios.delete(`https://api.spotify.com/v1/me/tracks`, {
            headers,
            data: { ids }
        });
        res.json(result.data);
    } catch (error) {
        console.error('Error removing saved tracks:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
            return next(new ExpressError(error.response.status, error.response.data.error.message));
        } else {
            return next(new ExpressError(500, "Internal Server Error"));
        }
    }
}));

//to check if the user has saved those tracks
router.route("/tracks/contains")
.get(isLogined, wrapAsync(async (req, res, next) => {
    let { ids } = req.query; // A comma-separated list of track IDs
    let headers = { "Authorization": `Bearer ${req.session.accessToken}` };
    
    try {
        let result = await axios.get(`https://api.spotify.com/v1/me/tracks/contains?ids=${ids}`, { headers });
        res.json(result.data);
    } catch (error) {
        console.error('Error checking saved tracks:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
            return next(new ExpressError(error.response.status, error.response.data.error.message));
        } else {
            return next(new ExpressError(500, "Internal Server Error"));
        }
    }
}));


//custom routes
router.route("/friends")
.get(isLogined,wrapAsync(async(req,res,next)=>{
    let user=await User.findOne({username:req.session.accountId});
    res.status(200).json(user.friends);
}))
//TODO: make it post and send friends id inside req body
.post(isLogined,wrapAsync(async(req,res,next)=>{
    //TODO: server side validation
    let {friend_id}=req.body;
    if(!friend_id)
        res.status(400).send("No user id specified");
    try{
        let user=await User.findOne({username:req.session.accountId});
        if (!user) { return next(new ExpressError(404, "User not found")); }
        console.log(user);
        if (user.friends.includes(friend_id)) { return res.status(400).json({ message: "Friend already exists in the list" }); }

        //TODO: currently save any user id as their friend but later the usr can check if their friend is on the platform or not
        user.friends.push(friend_id);
        console.log(user);
        await user.save();
        res.status(200).json({ message: "Friend added successfully" });
    }
    catch(err)
    {
        return next(new ExpressError(400,"Bad request"));
    }
}))
.delete(isLogined,wrapAsync(async(req,res,next)=>{
    //TODO: validation
    let {friend_id}=req.query;
    let user=await User.findOne({username:req.session.accountId});
    user.friends.pull(friend_id);
    await user.save();
    res.status(200).json(user.friends);
}));

router.route("/groups")
.get(isLogined,wrapAsync(async(req,res,next)=>{
    let user=await User.findOne({username:req.session.accountId});
    let groups=await Group.find({owner:user._id});
    res.status(200).json(groups);
}))
.post(isLogined,wrapAsync(async(req,res,next)=>{
    let {name,description}=req.body;
    let user=await User.findOne({username:req.session.accountId});
    let group=new Group({name,description,owner:user._id}); 
}))




//start/resume
//first check if the player is active, otherwise it will give error
// //only works for the PREMIUM USERS
// router.route("/player/play")
// .get(isLogined, wrapAsync(async (req, res, next) => {
//     let headers = { "Authorization": `Bearer ${req.session.accessToken}` };

//     try {
//         let result = await axios.get(`https://api.spotify.com/v1/me/player`, { headers });
//         let device_id = result.data.device.id;
//         let context_uri = result.data.context.uri;
//         let offset = { position: 1 };

//         result = await axios.put(
//             `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`,
//             { context_uri, offset, position_ms: 0 },
//             { headers }
//         );
//         res.json(result.data);
//     } catch (error) {
//         console.error('Error controlling playback:', error.message);
//         if (error.response) {
//             console.error('Response status:', error.response.status);
//             console.error('Response data:', error.response.data);
//             return next(new ExpressError(error.response.status, error.response.data.error.message));
//         } else {
//             return next(new ExpressError(500, "Internal Server Error"));
//         }
//     }
// }));



module.exports=router;