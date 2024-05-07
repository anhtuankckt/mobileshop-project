const configModel = require('../models/configModel')
const sliderModel = require('../models/sliderModel')
const bannerModel = require('../models/bannerModel')
const customerModel = require('../models/customerModel')
const categoryModel = require('../models/categoryModel')

module.exports = async (req, res, next) => {
  const categories = await categoryModel.find({ is_delete: false })
  res.locals.categories = categories

  res.locals.totalCartItems = req.session.cart.reduce((total, item) => total + item.qty, 0)

  const configs = await configModel.findOne({ allow: true })
  res.locals.configs = configs

  const sliders = await sliderModel.findOne({ allow: true })
  res.locals.sliders = sliders

  const banners = await bannerModel.findOne({ allow: true })
  res.locals.banners = banners

  const customer = await customerModel.findOne({ email: req.session.customerEmail })
  res.locals.customer = customer

  next()
}