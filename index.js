const path = require('path')
const express = require('express')
const cookieParser = require('cookie-parser')
const db = require('./config/mongoose-connection')
const usersRouter = require('./routes/usersRouter')
const postsRouter = require('./routes/postsRouter')
const adminRouter = require('./routes/adminRouter')
const index = require('./routes/index')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', index)
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/admin', adminRouter);

app.listen(3000)