const express = require('express')
const router = express.Router()
const siteController = require('../../apps/controllers/siteController')

//GET /signup
router.get('/signup', siteController.signup)

//POST /signup
router.post('/signup', siteController.postSignup)

//GET /singin
router.get('/signin', siteController.signin)

//POST /signin
router.post('/signin', siteController.postSignin)

//GET /logout
router.get('/logout', siteController.logout)

module.exports = router