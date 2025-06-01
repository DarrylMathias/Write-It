const express = require('express')
const router = express.Router()

const { createUser, getLoginUser, postLoginUser, logoutUser, postEditUser, getEditUser } = require('../controllers/authController')
const isLoggedIn = require('../middlewares/isLoggedIn')

router.post('/create', createUser)

router.get('/login', getLoginUser)

router.post('/login', postLoginUser)

router.get('/logout', isLoggedIn, logoutUser)

router.post('/editProfile', isLoggedIn, postEditUser)

router.get('/editProfile', isLoggedIn, getEditUser)

module.exports = router