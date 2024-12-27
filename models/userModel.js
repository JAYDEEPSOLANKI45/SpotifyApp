const mongoose=require("mongoose");

const userSchema=mongoose.Schema({
    username:String,
    name:String,
    email:String,
    url:String,
    genres:[String],
    groups:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Group"
        }
    ],
    friends:[String],
    //TODO: genres and pending friend requests fields to be added
    groupOwner:[
        {
            type:mongoose.Schema.Types.ObjectId,
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

module.exports=mongoose.model("MusicUser",userSchema);