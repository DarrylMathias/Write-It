const express = require('express')
const router = express.Router()

const { admin, login, logout, dashboard, deleteUser, readPost, deletePost } = require('../controllers/adminController')
const isAdminLoggedIn = require('../middlewares/isAdminLoggedIn')

router.get('/', admin)

router.post('/login', login)

router.get('/logout', isAdminLoggedIn, logout)

router.get('/dashboard', isAdminLoggedIn, dashboard)

router.get('/deleteUser/:userid', isAdminLoggedIn, deleteUser)

router.get('/readPost/:postid', isAdminLoggedIn, readPost)

router.get('/deletePost/:postid', isAdminLoggedIn, deletePost)

module.exports = router