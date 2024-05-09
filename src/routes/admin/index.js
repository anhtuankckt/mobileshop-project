const express = require('express')
const router = express.Router()
const authRoute = require('./authRoute')
const userRoute = require('./userRoute')
const productRoute = require('./productRoute')
const categoryRoute = require('./categoryRoute')
const commentRoute = require('./commentRoute')
const configRoute = require('./configRoute')
const advertiseRoute = require('./advertiseRoute')
const orderRoute = require('./orderRoute')
const authMiddleware = require('../../apps/middlewares/authMiddleware')
const adminShareMiddleware = require('../../apps/middlewares/adminShareMiddleware')

// use share middeware
router.use(adminShareMiddleware)

// admin
router.use('/', authRoute)

// admin/users
router.use('/users', authMiddleware.checkAdmin, userRoute)
// authMiddleware.checkAdmin

// admin/categories
router.use('/categories', authMiddleware.checkAdmin, categoryRoute)
// authMiddleware.checkAdmin

// admin/products
router.use('/products', authMiddleware.checkAdmin, productRoute)
// authMiddleware.checkAdmin

// admin/comments
router.use('/comments', authMiddleware.checkAdmin, commentRoute)
// authMiddleware.checkAdmin

// admin/orders
router.use('/orders', authMiddleware.checkAdmin, orderRoute)

// admin/advertises
router.use('/advertises', authMiddleware.checkAdmin, advertiseRoute)
// authMiddleware.checkAdmin

// admin/configs
router.use('/configs', authMiddleware.checkAdmin, configRoute)
// authMiddleware.checkAdmin

module.exports = router
