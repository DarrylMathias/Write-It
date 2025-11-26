const jwt = require('jsonwebtoken')
const userModel = require('../models/user')
const postModel = require('../models/post')

module.exports.admin = (req, res) => {
    try {
        if (req.cookies.adminToken) {
            try {
                const data = jwt.verify(req.cookies.adminToken, process.env.JWT_KEY)
                data.verified ? res.redirect('admin/dashboard') :
                    res.render('admin')
            }
            catch (err) {
                res.render('admin')
            }
        } else {
            res.render('admin')
        }
    } catch (err) {
        console.log(`${err}`);
        res.send(`${err.message}`)
    }
}

module.exports.login = async (req, res) => {
    try {
        if (req.body.password === process.env.ADMIN_PASSWORD) {
            const adminToken = jwt.sign({ verified: true }, process.env.JWT_KEY)
            res.cookie('adminToken', adminToken);
            res.redirect('/admin/dashboard')
            console.log('Correct admin passoword');
        } else {
            res.render('admin')
            console.log('Incorrect admin passoword');
        }
    } catch (err) {
        console.log(`${err}`);
        res.send(`${err.message}`)
    }

}

module.exports.logout = (req, res) => {
    try {
        res.clearCookie('adminToken')
        res.redirect('/')
    } catch (err) {
        console.log(`${err}`);
        res.send(`${err.message}`)
    }
}

module.exports.dashboard = async (req, res) => {
    try {
        const users = await userModel.find()
        const posts = await postModel.find().populate('author')
        res.render('adminData', { users, posts })
    } catch (err) {
        console.log(`${err}`);
        res.send(`${err.message}`)
    }
}

module.exports.deleteUser = async (req, res) => {
    try {
        const user = await userModel.findOneAndDelete({ _id: req.params.userid })
        await postModel.deleteMany({ author: req.params.userid })
        await postModel.updateMany(
            { likes: req.params.userid },           // Find posts where this user liked
            { $pull: { likes: req.params.userid } } // Remove user's ID from likes
        );
        console.log(`Deleted ${user.name} from db`);
        res.redirect('/admin/dashboard')
    } catch (err) {
        console.log(`${err}`);
        res.send(`${err.message}`)
    }
}

module.exports.readPost = async (req, res) => {
    try {
        const post = await postModel.findOne({ _id: req.params.postid })
        res.send(`<h1>${post.title}</h1><br><p>${post.content}</p>`)
    } catch (err) {
        console.log(`${err}`);
        res.send(`${err.message}`)
    }
}

module.exports.deletePost = async (req, res) => {
    try {
        const post = await postModel.findOneAndDelete({ _id: req.params.postid })
        await userModel.updateMany(
            { posts: req.params.postid },           // Find posts where this user wrote
            { $pull: { posts: req.params.postid } } // Remove posts's ID from user
        );
        console.log(`Deleted ${post.title} from db`);

        res.redirect('/admin/dashboard')
    } catch (err) {
        console.log(`${err}`);
        res.send(`${err.message}`)
    }
}