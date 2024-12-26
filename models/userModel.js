const mongoose=require("mongoose");
const passportLocalMongoose=require("passport-local-mongoose");

const userSchema=mongoose.Schema({
    username:String,
    name:String,
    email:String,
    url:String,
    groups:[
        {
            type:mongoose.Types.ObjectId
        }
    ],
    friends:[
        {
            type:String
        }
    ]
});

userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User",userSchema);