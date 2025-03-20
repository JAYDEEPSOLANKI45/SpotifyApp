const express=require("express");
const { isLogined, saveRedirectUrl } = require("../utils/middlewares");
const { wrapAsync } = require("../utils/utils");
const axios = require("axios");
const ExpressError=require("../utils/ExpressError");
const qs = require("qs");
const User = require("../models/userModel");
const router=express.Router();


function calculateSimilarity(currentGenres, otherGenres) {
    // Tokenize genres into individual words
    const tokenize = genres => genres.flatMap(genre => genre.split(' ').map(word => word.trim().toLowerCase()));

    const currentWords = tokenize(currentGenres); // Tokenized words for the current user
    const otherWords = tokenize(otherGenres); // Tokenized words for the other user

    // Count total occurrences in both arrays
    const intersectionCount = currentWords.filter(word => otherWords.includes(word)).length;
    const totalWords = currentWords.length + otherWords.length;

    // Calculate similarity percentage
    const similarityPercentage = (2 * intersectionCount / totalWords) * 100;

    return similarityPercentage.toFixed(2); // Round to 2 decimal places
}

router.use("/",async (req,res)=>{
    let list = await User.find();
    let currentUser = await User.findOne({ username: req.session.accountId });
    let percentage = new Array(list.length-1);
    let headers={ "Authorization":`Bearer ${req.session.accessToken}` }
    userList=new Array(list.length-1)
    for (let i=0; i<list.length; i++)
    {
        response=await axios.get(`https://api.spotify.com/v1/users/${list[i].username}`, {headers});
        userList[i]=response.data
    }
    for (let i = 0, j = 0; i < list.length; i++) {
        if (list[i]._id.toString() === currentUser._id.toString()) {
            continue;
        }
        percentage[j++] = calculateSimilarity(currentUser.genres, list[i].genres);
    }
    
    console.log(userList)
    console.log(currentUser)
    res.render("friends.ejs", {userList,currentUser,percentage}) 
});

module.exports=router;