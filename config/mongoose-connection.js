const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const connectionString = process.env.NODE_ENV === 'development' ? 'mongodb://127.0.0.1:27017/postfeature' : process.env.MONGO_URI

mongoose.connect(connectionString)
    .then(() => {
        console.log('Connected to db');
    })
    .catch((err) => {
        console.log(`Connection failed ${err}`);
    })

module.exports = mongoose.connection; //Sends connection across export