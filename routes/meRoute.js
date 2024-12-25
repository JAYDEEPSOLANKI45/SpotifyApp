const express=require("express");
const { isLogined } = require("../utils/middlewares");
const { wrapAsync } = require("../utils/utils");
const axios = require("axios");
const ExpressError = require("../utils/utils");
const router=express.Router();

router.route("/")
.get(isLogined, wrapAsync( async (req, res,next) => {
    const accessToken = req.session.accessToken;
    const headers = { 'Authorization': `Bearer ${accessToken}` };
    try {
        const response = await axios.get('https://api.spotify.com/v1/me', { headers });
        res.json(response.data);
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
}))


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


//player information
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