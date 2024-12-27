const mongoose=require("mongoose");
const passportLocalMongoose=require("passport-local-mongoose");

const userSchema=mongoose.Schema({
    username:String,
    name:String,
    email:String,
    url:String,
    groups:[
        {
            type:mongoose.Types.ObjectId,
            ref:"Group"
        }
    ],
    friends:[
        {
            type:String
        }
    ],
    //TODO: genres and pending friend requests fields to be added
    groupOwner:[
        {
            type:mongoose.Types.ObjectId,
            ref:"Group"
        }
    ],
    groupMember:[
        {
            type:mongoose.Types.ObjectId,
            ref:"Group"
        }
    ],
    outgoingRequests:[
        {
            type:mongoose.Types.ObjectId,
            ref:"Request"
        }
    ],
    incomingRequests:[
        {
            type:mongoose.Types.ObjectId,
            ref:"Request"
        }
    ]
});

userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("MusicUser",userSchema);