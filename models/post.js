const mongoose = require('mongoose')

// Mongoose connection happens only once for an application

const postSchema = mongoose.Schema({
    author: {
        // Id of author of the post
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    date: {
        type: Date,
        default: Date.now
    },
    title: String,
    content: String,
    likes: [{
        // An array of all the users who liked
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    image : String
})

module.exports = mongoose.model('post', postSchema)