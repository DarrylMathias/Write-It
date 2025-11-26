const userModel = require('../models/user')
const jwt = require('jsonwebtoken')

const isLoggedIn = async function isLoggedIn(req, res, next) {
    try {
        if (req.cookies.token) {
            try {
                let token = jwt.verify(req.cookies.token, process.env.JWT_KEY)
                const user = await userModel.findOne({ _id: token.id })
                req.user = user
                console.log('Correct cookie in middleware');
                next()
            } catch (error) {
                res.redirect('/')
                console.log(`In middleware, ${error}`);
            }
            // Sends a request of a user as user
        } else {
            res.redirect('/')
            console.log(`In middleware, no cookie`);
        }
    } catch (err) {
        res.send(`Error : ${err.message}`)
        console.log(`Error : ${err}`);
    }
}

module.exports = isLoggedIn