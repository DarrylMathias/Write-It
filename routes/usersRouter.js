const express = require('express')
const router = express.Router()

const { createUser, getLoginUser, postLoginUser, logoutUser, postEditUser, getEditUser, validateUser, postValidateUser } = require('../controllers/authController')
const isLoggedIn = require('../middlewares/isLoggedIn')
const isVerified = require('../middlewares/isVerified')

router.post('/create', createUser)

router.get('/validateUser', isLoggedIn, validateUser)

router.post('/postValidateUser', isLoggedIn, postValidateUser)

router.get('/login', getLoginUser)

router.post('/login', postLoginUser)

router.get('/logout', isLoggedIn, isVerified, logoutUser)

router.post('/editProfile', isLoggedIn, isVerified, postEditUser)

router.get('/editProfile', isLoggedIn, isVerified, getEditUser)

module.exports = router