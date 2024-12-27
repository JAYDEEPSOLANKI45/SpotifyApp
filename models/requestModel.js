const mongoose=require("mongoose");
const passportMongooseLocal=require("passport-local-mongoose")

const requestSchema=mongoose.Schema({
    from:mongoose.Types.ObjectId,
    to:mongoose.Types.ObjectId,
    for:String //friend or group
});

requestSchema.plugin(passportMongooseLocal);
module.exports=mongoose.model("Request",requestSchema);