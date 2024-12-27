const mongoose=require("mongoose");
const passportMongooseLocal=require("passport-local-mongoose")

const groupSchema=mongoose.Schema({
    name:String,
    description:String,
    genres:[String],
    owner:{
        type:mongoose.Types.ObjectId,
        ref:"MusicUser"
    },
    members:[
        {
            type:mongoose.Types.ObjectId,
            ref:"MusicUser"
        }
    ],
    //messages? model
    // nisarg
})