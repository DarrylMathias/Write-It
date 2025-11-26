const isVerified = async function isVerified(req, res, next) {
    try {
        if (req.user.isVerified) {
            try {
                console.log(`Verified user`);
                next()
            } catch (err) {
                res.send(`Error : ${err.message}`)
                console.log(`Error : ${err}`);
            }
        } else {
            res.redirect('/users/validateUser')
            console.log(`In middleware, not verified user`);
        }
    } catch (err) {
        res.send(`Error : ${err.message}`)
        console.log(`Error : ${err}`);
    }
}

module.exports = isVerified