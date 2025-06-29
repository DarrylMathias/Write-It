const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const uploadFile = require('../utils/uploadLogicImagekit')
const path = require('path')
const fs = require('fs')

const upload = require('../config/multer')
const multer = require('multer')
const userModel = require('../models/user')
const generateToken = require('../utils/generateToken')
const autoUserSend = require('../utils/autoUserSend')
const sendOTP = require('../utils/otpSend')

module.exports.createUser = async (req, res) => {
    try {
        const { name, email, age, password } = req.body
        if (req.body.nickname) return res.status(403).send("Bot detected");
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
                    res.render('index', { signinError: null, success: "Redirecting to validation", userid: `${newUser._id}` })
                    console.log('User created');
                    autoUserSend(user.email, user.name, user.age)
                });
            });
        }
    } catch (err) {
        res.send(`Error : ${err.message}`)
        console.log(`Error : ${err}`);
    }
}

module.exports.validateUser = async (req, res) => {
    const user = await userModel.findOne({ _id: req.user._id })
    const systemOtp = Math.floor(100000 + Math.random() * 900000)
    user.otp = systemOtp
    user.otpExpiry = Date.now() + 1000 * 60 * 5
    await user.save()
    sendOTP(user.email, systemOtp)
    res.render('validateUser', {
        success: null, error: null
    })
}

module.exports.postValidateUser = async (req, res) => {
    const user = await userModel.findOne({ _id: req.user._id })
    const { digit1, digit2, digit3, digit4, digit5, digit6 } = req.body
    const userOtp = Number(digit1 + digit2 + digit3 + digit4 + digit5 + digit6)
    console.log(userOtp);
    const systemOtp = user.otp
    console.log(systemOtp);
    console.log(userOtp === systemOtp);

    if (Date.now() > user.otpExpiry) {
        console.log('OTP expired');
        res.render('validateUser', {
            success: null, error: 'OTP expired.. Refresh page to generate another'
        })
    }
    if (systemOtp === userOtp) {
        console.log('OTP matches');
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();
        console.log('Redirecting to validateUser after success');
        
        res.render('validateUser', {
            success: 'Account verified successfully!', error: null
        })
    }
    else {
        console.log("OTP didn't match");
        res.render('validateUser', {
            success: null, error: 'Could not verify email account. Try again'
        })
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
        if (req.body.nickname) return res.status(403).send("Bot detected");
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
    } ``
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
                if (req.body.nickname) return res.status(403).send("Bot detected");
                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(password, salt, async function (err, hash) {

                        // Imagekit storage logic

                        let uploadedFile = { url: user.image }; // fallback in case no upload
                        if (req.file) {
                            try {
                                const filePath = path.join(__dirname, '../public/images/uploads', req.file.filename);
                                uploadedFile = await uploadFile(filePath, req.file.filename);
                                fs.unlink(filePath, (err) => {
                                    (err) ? console.error('Error deleting local file:', err) : console.log('Local file deleted:', filePath);
                                });
                                console.log(`Profile image uploaded at ${uploadedFile.url}`);

                            } catch (err) {
                                console.log(err);
                                return res.render('editProfile', { error: `Error uploading ${err.message}`, success: null, name: user.name, user: user })
                            }
                        }

                        const newUser = await userModel.findOneAndUpdate({ _id: user._id }, {
                            name,
                            age,
                            image: uploadedFile.url,
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