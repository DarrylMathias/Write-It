const express = require('express')
const router = express.Router()

const isLoggedIn = require('../middlewares/isLoggedIn')
const isVerified = require('../middlewares/isVerified')
const { viewAll, getWrite, postWrite, viewUser, getEdit, postEdit, deletePost, read, like } = require('../controllers/postControllers')

router.get('/viewAll', isLoggedIn, isVerified, viewAll)

router.get('/write', isLoggedIn, isVerified, getWrite)

router.post('/write', isLoggedIn, isVerified, postWrite)

router.get('/viewUser', isLoggedIn, isVerified, viewUser)

router.get('/edit/:postid', isLoggedIn, isVerified, getEdit)

router.post('/edit/:postid', isLoggedIn, isVerified, postEdit)

router.get('/delete/:postid', isLoggedIn, isVerified, deletePost)

router.get('/read/:postid', isLoggedIn, isVerified, read)

router.get('/like/:postid', isLoggedIn, isVerified, like)


module.exports = router