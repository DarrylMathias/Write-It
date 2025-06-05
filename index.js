const path = require('path')
const express = require('express')
const cookieParser = require('cookie-parser')
const db = require('./config/mongoose-connection')
const usersRouter = require('./routes/usersRouter')
const postsRouter = require('./routes/postsRouter')
const adminRouter = require('./routes/adminRouter')
const index = require('./routes/index')
const dotenv = require('dotenv')
dotenv.config()
const { rateLimit } = require('express-rate-limit')

const limiter = rateLimit({
	windowMs: 60 * 60 * 1000,
	limit: 100,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
	skipSuccessfulRequests: true,
})

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.set('trust proxy', 1); // trust first proxy

if (process.env.NODE_ENV === 'production') {
	app.use(limiter)
}

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', index)
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/admin', adminRouter);

const port = process.env.PORT || 3000

app.listen(port)