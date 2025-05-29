const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const path = require('path')
const userModel = require('./models/user')
const postModel = require('./models/post')
const upload = require('./config/multer')
const multer = require('multer')
const user = require('./models/user')
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const { env } = require('process')

const app = express()
dotenv.config();

app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser())

app.get('/', (req, res) => {
    res.render('index', { signinError: null, success: null, userid: null })
})

app.post('/create', async (req, res) => {
    upload.single('profileImage')(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            res.render('index', { signinError: `Error uploading ${err}`, success: null, userid: null })
            console.log('Multer error');
        } else if (err) {
            res.render('index', { signinError: `Error uploading ${err}`, success: null, userid: null })
            console.log('Unknown error');
        }
        else {
            const { name, email, age, password } = req.body
            const user = await userModel.findOne({ email })
            if (user) {
                res.render('index', { signinError: "User already exists.. Try with a different email or Login", success: null, userid: null })
                console.log('User exists');

            } else {
                // Hash password
                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(password, salt, async function (err, hash) {
                        const newUser = await userModel.create({
                            name,
                            age,
                            email,
                            image: req.file?.filename,
                            password: hash
                        })

                        //Set cookie
                        const signedEmail = jwt.sign({ id: newUser._id }, 'secret')
                        res.cookie('token', signedEmail)

                        res.render('index', { signinError: null, success: "Account created successfully. Redirecting.. ", userid: `${newUser._id}` })
                        console.log('User created');
                    });
                });
            }
        }
    })
})

app.post('/editProfile/:userid', async (req, res) => {
    upload.single('profileImage')(req, res, async function (err) {
        const user = await userModel.findOne({ _id: req.params.userid })
        if (err instanceof multer.MulterError) {
            res.render('editProfile', { error: `Error uploading ${err}`, success: null, userid: `${user._id}`, name: user.name, user: user })
            console.log('Multer error');
        } else if (err) {
            res.render('editProfile', { error: `Error uploading ${err}`, success: null, userid: `${user._id}`, name: user.name, user: user })
            console.log('Unknown error');
        }
        else {
            // Hash password
            const { name, age, password } = req.body
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(password, salt, async function (err, hash) {
                    const newUser = await userModel.findOneAndUpdate({ _id: user._id }, {
                        name,
                        age,
                        image: req.file?.filename || user.image, //Fallback
                        password: hash
                    }, { new: true })

                    //Set cookie
                    const signedEmail = jwt.sign({ id: newUser._id }, 'secret')
                    res.cookie('token', signedEmail)

                    res.render('editProfile', { error: null, success: "Account edited successfully. Redirecting.. ", userid: `${newUser._id}`, name: newUser.name, user: newUser })
                    console.log('User edited');
                });
            });
        }
    })
})

app.get('/editProfile/:userid', isLoggedIn, async (req, res) => {
    const user = await userModel.findOne({ _id: req.params.userid })
    res.render('editProfile', { userid: req.params.userid, name: user.name, user, success: null, error: null })
})

app.get(`/viewAllPosts/:userid`, isLoggedIn, async (req, res) => {
    const user = await userModel.findOne({
        _id: req.params.userid
    })
    const posts = await postModel.find()

    if (posts.length != 0) {
        const allPosts = await Promise.all(
            // An async map returns an array of promises thus theyre resolved
            // Like : Wait until all post fetches are done, then give me the full array of actual post data.
            posts.map(async (post) => {
                const user = await userModel.findOne({ _id: post.author })
                return {
                    // Used spread operator => _doc contains the raw data
                    ...post._doc,
                    authorName: user.name,
                    authorPhoto: user.image,
                    content: post.content.slice(0, 50) + '...'
                }
            }))
        console.log(allPosts);
        res.render('profile', { name: user.name, userid: req.params.userid, posts: allPosts, user })
        console.log('Displayed posts');
    } else {
        res.render('profile', { name: user.name, userid: req.params.userid, posts: null, user })
        console.log('No posts');
    }


})

app.get('/user/:userid', isLoggedIn, async (req, res) => {
    const user = await userModel.findOne({ _id: req.params.userid })
    res.redirect(`/viewAllPosts/${user._id}`)
    console.log(`${user.name} in dashboard`);
})

app.get('/post/:userid', isLoggedIn, async (req, res) => {
    const user = await userModel.findOne({ _id: req.params.userid })
    res.render('post', { name: user.name, userid: req.params.userid, error: null, success: null, user })
    console.log('About to post');
})

app.post('/post/:userid', isLoggedIn, async (req, res) => {
    const { title, content } = req.body
    const newPost = await postModel.create({
        author: req.params.userid,
        date: Date.now(),
        title,
        content
    })
    let user = await userModel.findOne({ _id: req.params.userid })
    sendMail(user.email, user.name, user.age, title, content)
    user.posts.push(newPost._id)
    const saved = await user.save() //For changes that dont happen through CRUD

    if (saved) {
        res.render('post', { name: user.name, userid: req.params.userid, error: null, success: 'Your post has been submitted! 🥳', user })
        console.log('Wrote post');
    } else {
        res.render('post', { name: user.name, userid: req.params.userid, error: "Post couldn't be submitted 😔", success: null, user })
        console.log('Not saved');
    }

})

app.get(`/viewposts/:userid`, isLoggedIn, async (req, res) => {
    const user = await userModel.findOne({ _id: req.params.userid })
    const allPostIDs = user.posts

    if (allPostIDs.length != 0) {
        const allPosts = await Promise.all(
            // An async map returns an array of promises thus theyre resolved
            // Like : Wait until all post fetches are done, then give me the full array of actual post data.
            allPostIDs.map(async (postID) => {
                const singlePost = await postModel.findOne({ _id: postID })
                return {
                    // Used spread operator => _doc contains the raw data
                    ...singlePost._doc,
                    content: singlePost.content.slice(0, 50) + '...'
                }
            }))
        console.log(allPosts);
        res.render('viewUserPosts', { userid: user._id, posts: allPosts, name: user.name, delete: null, user })
        console.log('Displayed posts');

    } else {
        res.render('viewUserPosts', { userid: user._id, posts: null, name: user.name, delete: null, user })
        console.log('No posts');
    }
})

app.get('/editPost/:postid', isLoggedIn, async (req, res) => {
    const post = await postModel.findOne({
        _id: req.params.postid
    })
    const user = await userModel.findOne({ _id: post.author })

    res.render('editPost', { userid: user._id, name: user.name, ...post._doc, error: null, success: null, user })
})

app.post('/editPost/:postid', isLoggedIn, async (req, res) => {
    const { title, content } = req.body
    const post = await postModel.findOneAndUpdate({ _id: req.params.postid }, {
        date: Date.now(),
        title,
        content
    })
    const user = await userModel.findOne({ _id: post.author })

    if (postModel) {
        res.render('editPost', { userid: user._id, name: user.name, ...post._doc, error: null, success: 'Your post has been edited successfully! 🥳', user })
        console.log('Wrote post');
    } else {
        res.render('editPost', { userid: user._id, name: user.name, ...post._doc, error: "Post couldn't be edited 😔", success: null, user })
        console.log('Not saved');
    }
})

app.get('/deletePost/:postid', isLoggedIn, async (req, res) => {
    const post = await postModel.findOneAndDelete({
        _id: req.params.postid
    })
    const user = await userModel.findOne({
        _id: post.author
    })

    await userModel.findOneAndUpdate({ _id: post.author }, {
        posts: user.posts.filter(p => p.toString() !== post._id.toString())
    })
    res.redirect(`/viewposts/${user._id}`)
})

app.get('/readPost/:postid/:userid', isLoggedIn, async (req, res) => {
    const post = await postModel.findOne({ _id: req.params.postid })
    const user = await userModel.findOne({ _id: req.params.userid })
    const author = await userModel.findOne({ _id: post.author })
    if (post.likes.indexOf(user._id) === -1) {
        res.render('readPost', { userid: user._id, post, name: user.name, like: false, user, author })
    } else {
        res.render('readPost', { userid: user._id, post, name: user.name, like: true, user, author })
    }
})

app.get('/likePost/:postid/:userid', isLoggedIn, async (req, res) => {
    const post = await postModel.findOne({ _id: req.params.postid.trim() })
    // .populate() fills all the ids of user with actual data

    const author = await userModel.findOne({ _id: post.author })
    const user = await userModel.findOne({ _id: req.params.userid.trim() })
    //Confirms that like has happened or not
    if (post.likes.indexOf(user._id) === -1) {
        post.likes.push(user._id)
        await post.save()
        console.log('Liked post');
        res.render('readPost', { userid: user._id, post, name: user.name, like: true, user, author })
    } else {
        post.likes.splice(post.likes.indexOf(user._id), 1)
        await post.save()
        console.log('Disliked post');
        res.render('readPost', { userid: user._id, post, name: user.name, like: false, user, author })
    }
})

app.get('/login', async (req, res) => {
    const token = req.cookies.token
    if (token) {
        try {
            const loggedinUser = jwt.verify(token, 'secret')
            console.log(loggedinUser.id);

            const loggedinUserData = await userModel.findOne({ _id: loggedinUser.id })
            console.log(loggedinUserData);

            console.log('User already logged in');
            res.redirect(`/viewAllPosts/${loggedinUserData._id}`)
        }
        catch (e) {
            res.render('login', { loginError: null, success: null, userid: null })
            console.log('Wrong token');
        }
    } else {
        console.log('Token doesnt exist');
        res.render('login', { loginError: null, success: null, userid: null })
    }
})

app.post('/login', async (req, res) => {

    const { email, password } = req.body

    const userExists = await userModel.findOne({ email })

    if (!userExists) {
        res.render('login', { loginError: "User doesn't exist.. Register now to create an account", success: null, userid: null })
        console.log("User doesn't exist");

    } else {
        const isVerified = await bcrypt.compare(password, userExists.password)
        if (isVerified) {


            //Set cookie
            const signedEmail = jwt.sign({ id: userExists._id }, 'secret')
            res.cookie('token', signedEmail)

            console.log('User logged in');
            res.render('login', { loginError: null, success: "Login created successfully. Redirecting.. ", userid: `${userExists._id}` })
        } else {
            console.log('Incorrect password');
            res.render('login', { loginError: "Invalid email or password", success: null, userid: null })
        }
    }
})

app.get('/logout', isLoggedIn, (req, res) => {
    res.clearCookie('token');
    console.log('Logged out => Removed token');
    res.redirect('/')
})


//Admin routes

app.get('/admin', (req, res) => {
    if (req.cookies.adminToken) {
        try {
            const data = jwt.verify(req.cookies.adminToken, 'secret')
            data.verified ? res.redirect('admin/dashboard') :
                res.render('admin')
        }
        catch (err) {
            res.render('admin')
        }
    } else {
        res.render('admin')
    }
})

app.post('/admin', async (req, res) => {
    if (req.body.password === process.env.ADMIN_PASSWORD) {
        const adminToken = jwt.sign({ verified: true }, 'secret')
        res.cookie('adminToken', adminToken);
        res.redirect('/admin/dashboard')
        console.log('Correct admin passoword');

    } else {
        res.render('admin')
        console.log('Incorrect admin passoword');

    }
})

app.get('/logout', (req, res) => {
    res.clearCookie('adminToken')
    res.redirect('/')
})

app.get('/admin/dashboard', adminLogin, async (req, res) => {
    const users = await userModel.find()
    const posts = await postModel.find().populate('author')
    res.render('adminData', { users, posts })
})

app.get('/admin/deleteUser/:userid', adminLogin, async (req, res) => {
    const user = await userModel.findOneAndDelete({ _id: req.params.userid })
    await postModel.deleteMany({ author: req.params.userid })
    await postModel.updateMany(
        { likes: req.params.userid },           // Find posts where this user liked
        { $pull: { likes: req.params.userid } } // Remove user's ID from likes
    );
    console.log(`Deleted ${user.name} from db`);
    
    res.redirect('/admin/dashboard')
})

app.get('/admin/readPost/:postid', adminLogin, async (req, res) => {
    const post = await postModel.findOne({ _id: req.params.postid })
    res.send(`<h1>${post.title}</h1><br><p>${post.content}</p>`)
})

app.get('/admin/deletePost/:postid', adminLogin, async (req, res) => {
    const post = await postModel.findOneAndDelete({ _id: req.params.postid })
    await userModel.updateMany(
        { posts: req.params.postid },           // Find posts where this user wrote
        { $pull: { posts: req.params.postid } } // Remove posts's ID from likes
    );
    console.log(`Deleted ${post.title} from db`);
    
    res.redirect('/admin/dashboard')
})

function adminLogin(req, res, next) {
    if (req.cookies.adminToken) {
        try {
            const data = jwt.verify(req.cookies.adminToken, 'secret')
            data.verified ? next() : res.redirect('/')
        }
        catch (err) {
            res.redirect('/')
        }
    } else {
        res.redirect('/')
    }
}



// Middleware that protects the route by checking if you're logged in or not
function isLoggedIn(req, res, next) {
    if (req.cookies.token) {
        try {
            let user = jwt.verify(req.cookies.token, 'secret')
            next()
        } catch (error) {
            res.redirect('/')
        }
        // req.user = data
        // Sends a request of a user as user
    } else {
        res.redirect('/')
    }
}

// Nodemailer function
function sendMail(email, name, age, title, body) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.APP_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TO,
            subject: `Post from ${name}, {${email}, ${age}}, Title : ${title}`,
            text: body,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email error:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
    } catch (err) {
        console.error("Failed to send email:", err);
    }
}

app.listen('3000', () => {
    console.log('Server running on port 3000');
})