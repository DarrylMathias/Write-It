const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

mongoose.connect(`${process.env.MONGO_URI}`)
.then(() => {
    console.log('Connected to db');
})
.catch((err) => {
    console.log(`Connection failed ${err}`);
})

module.exports = mongoose.connection; //Sends connection across export