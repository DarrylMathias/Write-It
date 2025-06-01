const express = require('express')
const router = express.Router()

const isLoggedIn = require('../middlewares/isLoggedIn')
const { viewAll, getWrite, postWrite, viewUser, getEdit, postEdit, deletePost, read, like } = require('../controllers/postControllers')

router.get('/viewAll', isLoggedIn, viewAll)

router.get('/write', isLoggedIn, getWrite)

router.post('/write', isLoggedIn, postWrite)

router.get('/viewUser', isLoggedIn, viewUser)

router.get('/edit/:postid', isLoggedIn, getEdit)

router.post('/edit/:postid', isLoggedIn, postEdit)

router.get('/delete/:postid', isLoggedIn, deletePost)

router.get('/read/:postid', isLoggedIn, read)

router.get('/like/:postid', isLoggedIn, like)


module.exports = router