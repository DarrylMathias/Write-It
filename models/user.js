const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/postfeature')

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
    }]
})

module.exports = mongoose.model('user', userSchema)