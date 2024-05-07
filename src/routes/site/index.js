const express = require('express')
const router = express.Router()
const authRoute = require('./authRoute')
const siteController = require('../../apps/controllers/siteController')
const shareMiddleware = require('../../apps/middlewares/shareMiddleware')
const cartMiddleware = require('../../apps/middlewares/cartMiddleware')
const authMiddleware = require('../../apps/middlewares/authMiddleware')

// Use cartMiddleware session.cart for all router
router.use(cartMiddleware)

// Use Middleware locals for all router
router.use(shareMiddleware)

// Route về đăng kí, đăng nhập
router.use('/', authRoute)

//GET /
router.get('/', siteController.home)

//GET /category
router.get('/category/:id', siteController.category)

//GET /product
router.get('/product/:id', siteController.product)

//POST /product/:id
router.post('/product/:id', siteController.comment)

//GET /search
router.get('/search', siteController.search)

//GET /search/name-categories
router.get('/search/name-products', siteController.nameProducts)

//GET /cart
router.get('/cart', siteController.cart)

//POST /add-to-cart
router.post('/add-to-cart', siteController.addToCart)

//GET /update-cart
router.post('/update-cart', siteController.updateCart)

//GET /del-cart/:d
router.get('/del-cart/:id', siteController.deleteCart)

//GET /oder
router.get('/order/:id', siteController.order)

//GET /success
router.get('/success', authMiddleware.checkCustomer, siteController.success)

//GET /success/list/:id
router.get('/success/list/:id', authMiddleware.checkCustomer, siteController.successList)

module.exports = router
