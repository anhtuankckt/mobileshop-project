const express = require('express')
const session = require('express-session')
const config = require('config')
const routes = require('../routes/web')
const cookieParser = require('cookie-parser')
const app = express()

// passport google, facebook
require('../common/passport')

// Lấy dữ liệu của form ở req.body
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Dùng cookie-parser
app.use(cookieParser())

// Định nghĩa đường dẫn tĩnh tới public
app.use("/static", express.static(config.get('app.staticFolder')))

// Config view engine - ejs
app.set("views", config.get('app.viewsFolder'))
app.set("view engine", config.get('app.viewEngine'))

// Config express-session
app.set("trust proxy", 1)
app.use(
  session({
    secret: config.get('app.sessionKey'),
    resave: false,
    saveUninitialized: true,
    cookie: { secure: config.get('app.sessionSecure') }
  })
)

// Run routes
app.use(routes)

module.exports = app
