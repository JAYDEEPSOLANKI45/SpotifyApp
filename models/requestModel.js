const mongoose=require("mongoose");
const passportMongooseLocal=require("passport-local-mongoose")


//TODO: mongoose validation
const requestSchema=mongoose.Schema({
    from:{
        type:mongoose.Types.ObjectId,
        ref:"MusicUser"
    },
    to:{
        type:mongoose.Types.ObjectId,
        ref:"MusicUser"
    },
    type:String, //friend or group
    groupId:{
        type:mongoose.Types.ObjectId,
        ref:"Group"
    }
});

requestSchema.plugin(passportMongooseLocal);
module.exports=mongoose.model("Request",requestSchema);