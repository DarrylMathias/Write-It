const jwt = require('jsonwebtoken')

const adminLogin = function adminLogin(req, res, next) {
    if (req.cookies.adminToken) {
        try {
            const data = jwt.verify(req.cookies.adminToken, process.env.JWT_KEY)
            data.verified ? next() : res.redirect('/')
        }
        catch (err) {
            res.redirect('/')
            console.log('Invalid admin token');
            
        }
    } else {
        res.redirect('/')
        console.log('Invalid admin token');
        
    }
}

module.exports = adminLogin