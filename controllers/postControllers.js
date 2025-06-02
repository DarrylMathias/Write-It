const userModel = require('../models/user')
const postModel = require('../models/post')
const autoPostSend = require('../utils/autoPostSend')

module.exports.viewAll = async (req, res) => {
    try {
        const user = await userModel.findOne({
            _id: req.user._id
        })
        const posts = await postModel.find().populate('author')

        if (posts.length != 0) {
            const allPosts =
                posts.map((post) => {
                    return {
                        // Used spread operator => _doc contains the raw data
                        ...post._doc,
                        authorName: post.author.name,
                        authorPhoto: post.author.image,
                        content: post.content.slice(0, 50) + '...'
                    }
                })
            res.render('profile', { name: user.name, posts: allPosts, user })
            console.log('Displayed posts');
            console.log(`${user.name} in dashboard`);
        } else {
            res.render('profile', { name: user.name, posts: null, user })
            console.log('No posts');
        }
    } catch (err) {
        res.send(`Error : ${err.message}`)
        console.log(`Error : ${err}`);
    }
}

module.exports.getWrite = async (req, res) => {
    try {
        const user = await userModel.findOne({ _id: req.user._id })
        res.render('post', { name: user.name, error: null, success: null, user })
        console.log('About to post');
    } catch (err) {
        res.send(`Error : ${err.message}`)
        console.log(`Error : ${err}`);
    }
}

module.exports.postWrite = async (req, res) => {
    try {
        const { title, content } = req.body
        const newPost = await postModel.create({
            author: req.user._id,
            date: Date.now(),
            title,
            content
        })
        let user = await userModel.findOne({ _id: req.user._id })
        autoPostSend(user.email, user.name, user.age, title, content)
        newPostUser(user.name, title, content)
        sendPostUser(user.email, user.name, title, content)
        user.posts.push(newPost._id)
        const saved = await user.save() //For changes that dont happen through CRUD

        if (saved) {
            res.render('post', { name: user.name, error: null, success: 'Your post has been submitted! 🥳', user })
            console.log('Wrote post');
        } else {
            res.render('post', { name: user.name, error: "Post couldn't be submitted 😔", success: null, user })
            console.log('Not saved');
        }
    } catch (err) {
        res.send(`Error : ${err.message}`)
        console.log(`Error : ${err}`);
    }
}

module.exports.viewUser = async (req, res) => {
    try {

        const user = await userModel.findOne({ _id: req.user._id }).populate('posts')

        if (user.posts.length != 0) {
            const allPosts =
                user.posts.map((post) => {
                    return {
                        // Used spread operator => _doc contains the raw data
                        ...post._doc,
                        content: post.content.slice(0, 50) + '...'
                    }
                })
            res.render('viewUserPosts', { posts: allPosts, name: user.name, delete: null, user })
            console.log('Displayed posts');

        } else {
            res.render('viewUserPosts', { posts: null, name: user.name, delete: null, user })
            console.log('No posts');
        }
    } catch (err) {
        res.send(`Error : ${err.message}`)
        console.log(`Error : ${err}`);
    }
}

module.exports.getEdit = async (req, res) => {
    try {
        const post = await postModel.findOne({
            _id: req.params.postid
        })
        const user = await userModel.findOne({ _id: post.author })

        res.render('editPost', { name: user.name, ...post._doc, error: null, success: null, user })
    } catch (err) {
        res.send(`Error : ${err.message}`)
        console.log(`Error : ${err}`);
    }
}

module.exports.postEdit = async (req, res) => {
    try {

        const { title, content } = req.body
        const post = await postModel.findOneAndUpdate({ _id: req.params.postid }, {
            title,
            content
        })
        const user = await userModel.findOne({ _id: post.author })

        if (postModel) {
            res.render('editPost', { name: user.name, ...post._doc, error: null, success: 'Your post has been edited successfully! 🥳', user })
            console.log('Wrote post');
        } else {
            res.render('editPost', { name: user.name, ...post._doc, error: "Post couldn't be edited 😔", success: null, user })
            console.log('Not saved');
        }
    } catch (err) {
        res.send(`Error : ${err.message}`)
        console.log(`Error : ${err}`);
    }
}

module.exports.deletePost = async (req, res) => {
    try {
        const post = await postModel.findOneAndDelete({
            _id: req.params.postid
        })
        const user = await userModel.findOne({
            _id: post.author
        })

        await userModel.findOneAndUpdate({ _id: post.author }, {
            posts: user.posts.filter(p => p.toString() !== post._id.toString())
        })
        res.redirect('/posts/viewUser')
    } catch (err) {
        res.send(`Error : ${err.message}`)
        console.log(`Error : ${err}`);
    }
}

module.exports.read = async (req, res) => {
    try {
        const post = await postModel.findOne({ _id: req.params.postid })
        const user = await userModel.findOne({ _id: req.user._id })
        const author = await userModel.findOne({ _id: post.author })
        if (post.likes.indexOf(user._id) === -1) {
            res.render('readPost', { post, name: user.name, like: false, user, author })
        } else {
            res.render('readPost', { post, name: user.name, like: true, user, author })
        }
    } catch (err) {
        res.send(`Error : ${err.message}`)
        console.log(`Error : ${err}`);
    }
}

module.exports.like =  async (req, res) => {
    try {
        const post = await postModel.findOne({ _id: req.params.postid.trim() })
        const author = await userModel.findOne({ _id: post.author })
        const user = await userModel.findOne({ _id: req.user._id })
        //Confirms that like has happened or not
        if (post.likes.indexOf(user._id) === -1) {
            post.likes.push(user._id)
            await post.save()
            console.log('Liked post');
            res.render('readPost', { post, name: user.name, like: true, user, author })
        } else {
            post.likes.splice(post.likes.indexOf(user._id), 1)
            await post.save()
            console.log('Disliked post');
            res.render('readPost', { post, name: user.name, like: false, user, author })
        }
    } catch (err) {
        res.send(`Error : ${err.message}`)
        console.log(`Error : ${err}`);
    }
}