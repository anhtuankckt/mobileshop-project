const commentModel = require('../models/commentModel')
const productModel = require('../models/productModel')
const userModel = require('../models/userModel')
const paginate = require('../../common/paginate')
const timesAgo = require('../../libs/timesAgo')

const index = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = page * limit - limit

  const comments = await commentModel.find()
    .populate('prd_id')
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit)

  const totalRows = await commentModel.countDocuments()
  const totalPages = Math.ceil(totalRows / limit)

  const user = await userModel.findOne({ email: req.session.email })
  const role = user?.role

  res.render('admin/comments/comment', {
    comments,
    currentPage: page,
    totalPages,
    totalRows,
    pages: paginate(page, totalPages),
    timesAgo,
    role
  })
}

const approve = async (req, res) => {
  const { id } = req.params
  const comment = await commentModel.findById(id)

  if (!comment) res.redirect('/admin/comments')

  const commentUpdate = {
    allow: !comment.allow
  }

  await commentModel.updateOne({ _id: id }, { $set: commentUpdate })
  res.redirect('/admin/comments')
}

const del = async (req, res) => {
  // Xóa comment cần prd_id và comment_id của comment
  // Lấy mảng các comment id
  const { ids } = req.params
  const arrIds = ids.split(',')
  // Tìm comment để lấy prd_id
  const comments = await commentModel.find({ _id: { $in: arrIds } })

  // Lặp qua từng comment rồi xóa, cập nhật lại width
  for (let comment of comments) {
    // 1. Lấy left và right
    const leftValue = comment.left
    const rightValue = comment.right

    // 2. Tính width
    const width = rightValue - leftValue + 1

    // 3. Xóa comment
    await commentModel.deleteMany({
      prd_id: comment.prd_id.toString(),
      left: { $gte: leftValue, $lte: rightValue }
    })

    // 4. Cập nhật left và right các comment khác
    await commentModel.updateMany({
      prd_id: comment.prd_id.toString(),
      right: { $gt: rightValue }
    }, { $inc: { right: -width } })

    await commentModel.updateMany({
      prd_id: comment.prd_id.toString(),
      left: { $gt: leftValue }
    }, { $inc: { left: -width } })
  }

  res.redirect('/admin/comments')
}

module.exports = { index, del, approve }