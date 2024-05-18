const userModel = require('../models/userModel')
const customerModel = require('../models/customerModel')

const checkLogin = (req, res, next) => {
  if (req.session.email && req.session.password)
    return res.redirect("/admin/dashboard")

  next()
}

const checkAdmin = (req, res, next) => {
  if (!req.session.email || !req.session.password)
    return res.redirect("/admin/login")

  next()
}

const checkCustomer = (req, res, next) => {
  if (!req.session.customerEmail) return res.redirect('/')

  next()
}

const checkRole = async (req, res, next) => {
  let role
  if (req.session.email) {
    const user = await userModel.findOne({ email: req.session.email })
    role = user?.role
  }
  if (!role || role !== 'admin') {
    return res.redirect('/admin/dashboard')
  }

  next()
}

const checkCookieAdmin = async (req, res, next) => {
  const savedEmail = req.cookies.savedEmail
  if (savedEmail) {
    const user = await userModel.findOne({ email: savedEmail })
    if (user) {
      req.session.email = user?.email
      req.session.password = user?.password
    }
  }
  next()
}

const checkCookieSite = async (req, res, next) => {
  const savedEmailSite = req.cookies.savedEmailSite
  if (savedEmailSite) {
    req.session.customerEmail = savedEmailSite
  }

  next()
}

const checkCustomerDeleted = async (req, res, next) => {
  if (req.session.customerEmail) {
    const user = await customerModel.findOne({ email: req.session.customerEmail })
    if (user.is_delete) {
      delete req.session.customerEmail
    }
  }

  next()
}

module.exports = { checkLogin, checkAdmin, checkCustomer, checkRole, checkCookieAdmin, checkCookieSite, checkCustomerDeleted }
