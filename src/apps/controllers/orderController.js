const orderModel = require('../models/orderModel')
const paginate = require('../../common/paginate')
const vndPrice = require('../../libs/vndPrice')
const customerModel = require('../models/customerModel')

/** INDEX */
const index = async (req, res) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const skip = page * limit - limit
  const query = {}
  query.is_delete = false

  const orders = await orderModel.find(query)
    .populate('customer_id')
    .populate('items.prd_id')
    .skip(skip)
    .limit(limit)
    .sort({ _id: -1 })

  const totalRows = await orderModel.find(query).countDocuments()
  const totalPages = Math.ceil(totalRows / limit)

  res.render('admin/orders/order', {
    orders,
    currentPage: page,
    totalPages,
    pages: paginate(page, totalPages),
    vndPrice
  })
}

const confirm = async (req, res) => {
  const { ids } = req.params
  const arrIds = ids.split(',')
  await orderModel.updateMany({ _id: { $in: arrIds } }, { $set: { confirmed: true } })
  res.redirect('/admin/orders')
}

// Xóa mềm
const del = async (req, res) => {
  const { ids } = req.params
  const arrIds = ids.split(',')
  await orderModel.updateMany({ _id: { $in: arrIds } }, { $set: { is_delete: true } })
  res.redirect('/admin/orders')
}

/** TRASH */
const trash = async (req, res) => {
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const skip = page * limit - limit
  const error = req.query.error
  const query = {}
  query.is_delete = true

  const orders = await orderModel.find(query)
    .populate('customer_id')
    .populate('items.prd_id')
    .skip(skip)
    .limit(limit)
    .sort({ _id: -1 })

  const totalRows = await orderModel.find(query).countDocuments()
  const totalPages = Math.ceil(totalRows / limit)

  res.render('admin/orders/trash_order', {
    orders,
    currentPage: page,
    totalPages,
    pages: paginate(page, totalPages),
    vndPrice,
    error
  })
}

const trashRestore = async (req, res) => {
  const { ids } = req.params
  const arrIds = ids.split(',')

  const orders = await orderModel.find({ _id: { $in: arrIds } }).populate('customer_id')

  for (let order of orders) {
    if (order.customer_id.is_delete) {
      const error = `Khách hàng đã bị xóa, không khôi phục được!`
      return res.redirect(`/admin/orders/trash?error=${error}`)
    }
  }

  await orderModel.updateMany({ _id: { $in: arrIds } }, { $set: { is_delete: false } })
  res.redirect('/admin/orders/trash')
}

// Xóa cứng
const trashDelete = async (req, res) => {
  const { ids } = req.params
  const arrIds = ids.split(',')
  await orderModel.deleteMany({ _id: { $in: arrIds } })
  res.redirect('/admin/orders/trash')
}

module.exports = {
  index,
  del,
  confirm,
  trash,
  trashRestore,
  trashDelete
}