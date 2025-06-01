const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const upload = require('../config/multer')
const multer = require('multer')
const userModel = require('../models/user')
const generateToken = require('../utils/generateToken')
const autoUserSend = require('../utils/autoUserSend')

module.exports.createUser = async (req, res) => {
    try {
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
                        email,
                        password: hash
                    })

                    //Set cookie
                    const token = generateToken(newUser)
                    res.cookie('token', token)

                    autoUserSend(email, name, age)
                    res.render('index', { signinError: null, success: "Account created successfully. Redirecting.. ", userid: `${newUser._id}` })
                    console.log('User created');
                });
            });
        }
    } catch (err) {
        res.send(`Error : ${err.message}`)
        console.log(`Error : ${err}`);
    }
}

module.exports.getLoginUser = async (req, res) => {
    try {
        const token = req.cookies.token
        if (token) {
            try {
                const loggedinUser = jwt.verify(token, process.env.JWT_KEY)
                const loggedinUserData = await userModel.findOne({ _id: loggedinUser.id })
                console.log('User already logged in');
                res.redirect(`/posts/viewAll`)
            }
            catch (e) {
                res.render('login', { loginError: null, success: null, userid: null })
                console.log('Wrong token');
            }
        } else {
            console.log('Token doesnt exist');
            res.render('login', { loginError: null, success: null, userid: null })
        }
    } catch (err) {
        res.send(`Error : ${err.message}`)
        console.log(`Error : ${err}`);
    }

}

module.exports.postLoginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const userExists = await userModel.findOne({ email })

        if (!userExists) {
            res.render('login', { loginError: "User doesn't exist.. Register now to create an account", success: null, userid: null })
            console.log("User doesn't exist");

        } else {
            const isVerified = await bcrypt.compare(password, userExists.password)
            if (isVerified) {
                //Set cookie
                const token = generateToken(userExists)
                res.cookie('token', token)

                console.log('User logged in');
                res.render('login', { loginError: null, success: "Login created successfully. Redirecting.. ", userid: `${userExists._id}` })
            } else {
                console.log('Incorrect password');
                res.render('login', { loginError: "Invalid email or password", success: null, userid: null })
            }
        }
    } catch (err) {
        res.send(`Error : ${err.message}`)
        console.log(`Error : ${err}`);
    }
}

module.exports.logoutUser = (req, res) => {
    try {
        res.clearCookie('token');
        console.log('Logged out => Removed token');
        res.redirect('/')
    } catch (err) {
        res.send(`Error : ${err.message}`)
        console.log(`Error : ${err}`);
    }``
}

module.exports.getEditUser = async (req, res) => {
    const user = await userModel.findOne({ _id: req.user._id })
    res.render('editProfile', { error: null, success: null, name: user.name, user: user })
}

module.exports.postEditUser = async (req, res) => {
    try {
        upload.single('profileImage')(req, res, async function (err) {
            const user = await userModel.findOne({ _id: req.user._id })
            if (err instanceof multer.MulterError) {
                res.render('editProfile', { error: `Error uploading ${err}`, success: null, name: user.name, user: user })
                console.log('Multer error');
            } else if (err) {
                res.render('editProfile', { error: `Error uploading ${err}`, success: null, name: user.name, user: user })
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
                        const token = generateToken(newUser)
                        res.cookie('token', token)

                        res.render('editProfile', { error: null, success: "Account edited successfully. Redirecting.. ", userid: `${newUser._id}`, name: newUser.name, user: newUser })
                        console.log('User edited');
                    });
                });
            }
        })
    } catch (err) {
        res.send(`Error : ${err.message}`)
        console.log(`Error : ${err}`);
    }
}