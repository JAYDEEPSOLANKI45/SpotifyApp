const express=require("express");
const { isLogined } = require("../utils/middlewares");
const { wrapAsync } = require("../utils/utils");
const axios = require("axios");
const ExpressError=require("../utils/ExpressError");
const router=express.Router();

//for multiple tracks
router.route("/")
.get(isLogined, wrapAsync(async (req, res, next) => {
    let { ids } = req.query; // A comma-separated list of track IDs
    let headers = { "Authorization": `Bearer ${req.session.accessToken}` };
    
    try {
        let result = await axios.get(`https://api.spotify.com/v1/tracks?ids=${ids}`, { headers });
        res.json(result.data);
    } catch (error) {
        console.error('Error fetching tracks:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
            return next(new ExpressError(error.response.status, error.response.data.error.message));
        } else {
            return next(new ExpressError(500, "Internal Server Error"));
        }
    }
}));

//for a single track
router.route("/:id")
.get(isLogined, wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let headers = { "Authorization": `Bearer ${req.session.accessToken}` };
    
    try {
        let result = await axios.get(`https://api.spotify.com/v1/tracks/${id}`, { headers });
        res.json(result.data);
    } catch (error) {
        console.error('Error fetching track:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
            return next(new ExpressError(error.response.status, error.response.data.error.message));
        } else {
            return next(new ExpressError(500, "Internal Server Error"));
        }
    }
}));


module.exports=router;