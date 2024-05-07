const express = require('express')
const router = express.Router()
const authController = require('../../apps/controllers/authController')
const authMiddleware = require('../../apps/middlewares/authMiddleware')
const { index } = require('../../apps/controllers/adminController')
const passport = require('passport')

// admin/signup
router.get('/signup', authController.signup)

// admin/signup
router.post('/signup', authController.postSignup)

// admin/signup/success
router.get('/signup/success', authController.getSignupSuccess)

// admin/signup/verification/:id/:token
router.get('/signup/verification/:id/:token', authController.verificationForSingup)

// admin/login
router.get('/login', authMiddleware.checkLogin, authController.getLogin)

// admin/postlogin
router.post('/login', authController.postLogin)

// admin/login/success
router.get('/login/success', authMiddleware.checkAdmin, authController.loginSuccess)

// admin/logout
router.get("/logout", authController.logout)

// admin/dashboard
router.get("/dashboard", authMiddleware.checkAdmin, index)

// admin/forgot-password
router.get('/forgot-password', authController.getForgotPassword)

// admin/forgot-password
router.post('/forgot-password', authController.postForgotPassword)

// admin/forgot-password-success
router.get('/forgot-password-success', authController.getForgotPasswordSuccess)

// admin/reset-password/:id/:token
router.get('/reset-password/:id/:token', authController.getResetPassword)

// admin/reset-password/:id/:token
router.post('/reset-password/:id/:token', authController.postResetPassword)

/** GOOGLE - FACEBOOK */
// admin/auth/google
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

// admin/auth/google/callback
router.get('/auth/google/callback', (req, res, next) => {
  passport.authenticate('google', { failureRedirect: '/admin/login' }, (err, profile) => {
    req.user = profile
    next()
  })(req, res, next)
}, (req, res) => {
  res.redirect(`/admin/auth/google/${req.user?.id}/${req.user.tokenLogin}`)
})

// admin/auth/facebook
router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }))

// admin/auth/facebook/callback
router.get('/auth/facebook/callback', (req, res, next) => {
  passport.authenticate('facebook', { failureRedirect: '/admin/login' }, (err, profile) => {
    req.user = profile
    next()
  })(req, res, next)
}, (req, res) => {
  res.redirect(`/admin/auth/facebook/${req.user?.id}/${req.user?.tokenLogin}`)
})

router.get('/auth/google/:google_id/:tokenLogin', authController.loginGoogle)

router.get('/auth/facebook/:facebook_id/:tokenLogin', authController.loginFacebook)

module.exports = router
