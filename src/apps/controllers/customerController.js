const customerModel = require('../models/customerModel')
const userModel = require('../models/userModel')
const orderModel = require('../models/orderModel')
const paginate = require('../../common/paginate')

const index = async (req, res) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const skip = page * limit - limit
  const query = {}
  query.is_delete = false

  const customers = await customerModel.find(query)
    .limit(limit)
    .skip(skip)

  const totalRows = await customerModel.find(query).countDocuments()
  const totalPages = Math.ceil(totalRows / limit)

  const user = await userModel.findOne({ email: req.session.email })
  const role = user?.role

  const orders = await orderModel.find({ is_delete: false })

  res.render('admin/customers/customer', {
    customers,
    currentPage: page,
    totalPages,
    pages: paginate(page, totalPages),
    role,
    orders
  })
}

const del = async (req, res) => {
  const { id } = req.params
  const customer = await customerModel.findById(id)
  if (!customer) {
    return res.redirect('/admin/customers')
  }

  await orderModel.updateMany({ customer_id: id }, { $set: { is_delete: true } })
  await customerModel.updateOne({ _id: id }, { $set: { is_delete: true } })
  res.redirect('/admin/customers')
}

const trash = async (req, res) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const skip = page * limit - limit
  const query = {}
  query.is_delete = true

  const customers = await customerModel.find(query)
    .limit(limit)
    .skip(skip)

  const totalRows = await customerModel.find(query).countDocuments()
  const totalPages = Math.ceil(totalRows / limit)

  const user = await userModel.findOne({ email: req.session.email })
  const role = user?.role

  const orders = await orderModel.find({ is_delete: false })

  res.render('admin/customers/customer_trash', {
    customers,
    currentPage: page,
    totalPages,
    pages: paginate(page, totalPages),
    role,
    orders
  })
}

const trashRestore = async (req, res) => {
  const { id } = req.params
  const customer = await customerModel.findById(id)
  if (!customer) {
    return res.redirect('/admin/customers/trash')
  }

  await customerModel.updateOne({ _id: id }, { $set: { is_delete: false } })
  res.redirect('/admin/customers/trash')
}

const trashDel = async (req, res) => {
  const { id } = req.params
  const customer = await customerModel.findById(id)
  if (!customer) {
    return res.redirect('/admin/customers/trash')
  }

  await orderModel.deleteMany({ customer_id: id })
  await customerModel.deleteOne({ _id: id })
  res.redirect('/admin/customers/trash')
}

module.exports = {
  index,
  del,
  trash,
  trashRestore,
  trashDel
}