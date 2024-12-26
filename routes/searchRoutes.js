const express=require("express");
const { isLogined } = require("../utils/middlewares");
const { wrapAsync } = require("../utils/utils");
const axios = require("axios");
const ExpressError=require("../utils/ExpressError");
const router=express.Router();

router.get('/', isLogined ,wrapAsync(async (req, res) => {
    const { q, type, market, limit = 20, offset = 0, include_external="audio" } = req.query;
    const headers = { 'Authorization': `Bearer ${req.session.accessToken}` }; // Construct query parameters
    const params = { q, type, market, limit, offset, include_external };
    try { const response = await axios.get('https://api.spotify.com/v1/search', { headers, params });
    res.json(response.data); }
    catch (error) {
        return next(new ExpressError(400,"Bad request"));
    }
}));

module.exports=router;