const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.render('index', { signinError: null, success: null, userid: null })
})

module.exports = router