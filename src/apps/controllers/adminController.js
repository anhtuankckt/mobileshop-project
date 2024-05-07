const productModel = require('../models/productModel')
const userModel = require('../models/userModel')
const commentModel = require('../models/commentModel')

const index = async (req, res) => {
  const totalProducts = await productModel.find().countDocuments()
  const totalUsers = await userModel.find().countDocuments()
  const totalComments = await commentModel.find().countDocuments()

  res.render("admin/dashboard", {
    totalProducts,
    totalUsers,
    totalComments
  })
}

module.exports = { index }
