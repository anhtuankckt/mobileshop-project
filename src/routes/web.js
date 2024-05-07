const express = require('express')
const router = express.Router()
const adminRouter = require('./admin')
const siteRoute = require('./site')
const authMiddleware = require('../apps/middlewares/authMiddleware')

//ADMIN admin
router.use('/admin', authMiddleware.checkCookieAdmin, adminRouter)

//SITE /
router.use('/', authMiddleware.checkCookieSite, siteRoute)

module.exports = router
