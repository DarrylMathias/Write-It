const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name : String,
    age : Number,
    email : String, 
    password : String,
    image : String,
    // User also has posts
    posts : [{
        // Ids of posts written by the user
        type : mongoose.Schema.Types.ObjectId,
        ref : 'post'
    }],
    isVerified : {
        type : Boolean,
        default : false
    },
    otp : Number,
    otpExpiry : Date
})

module.exports = mongoose.model('user', userSchema)