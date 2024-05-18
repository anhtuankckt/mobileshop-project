const userModel = require('../models/userModel')
const paginate = require('../../common/paginate')
const bcryptjs = require('bcryptjs')

const index = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = page * limit - limit
  const query = {}
  query.is_delete = false
  const users = await userModel
    .find(query)
    .sort({ role: 1, full_name: 1 })
    .limit(limit)
    .skip(skip)

  const totalRows = await userModel.find(query).countDocuments()
  const totalPages = Math.ceil(totalRows / limit)

  const delError = req.query.delError

  const user = await userModel.findOne({ email: req.session.email })
  const role = user?.role

  res.render('admin/users/user', {
    data: {
      users,
      currentPage: page,
      totalPages,
      pages: paginate(page, totalPages),
      delError
    },
    role
  })
}

const create = async (req, res) => {
  res.render('admin/users/add_user', {
    data: {}
  })
}

const store = async (req, res) => {
  const { full_name, email, password, confirmPassword, role } = req.body
  let error = null

  const checkUser = await userModel.findOne({ email })

  if (checkUser) {
    error = 'Email đã tồn tại !'
    return res.render('admin/users/add_user', {
      data: { error }
    })
  } else if (password !== confirmPassword) {
    error = 'Mật khẩu không khớp!';
    return res.render('admin/users/add_user', {
      data: { error }
    })
  }

  const hashedPassword = await bcryptjs.hash(password, 10)

  const user = {
    full_name,
    email,
    password: hashedPassword,
    role
  }

  await new userModel(user).save()
  res.redirect('/admin/users')
}

const edit = async (req, res) => {
  const { id } = req.params
  const user = await userModel.findById(id)

  res.render('admin/users/edit_user', {
    data: {},
    user
  })
}

const update = async (req, res) => {
  const { id } = req.params
  const { role } = req.body

  await userModel.updateOne({ _id: id }, { $set: { role: role } })
  res.redirect('/admin/users')
}

/** XÓA MỀM 1 THÀNH VIÊN */
const del = async (req, res) => {
  const { id } = req.params
  const user = await userModel.findById(id)

  if (!user) {
    return res.redirect('/admin/users')
  }

  const emailLogin = req.session.email

  if (user.email === emailLogin) {
    const delError = 'Không được xóa User chính bạn!'
    return res.redirect(`/admin/users?delError=${delError}`)
  }

  if (user.role === 'admin') {
    const delError = 'Không được xóa User Admin'
    return res.redirect(`/admin/users?delError=${delError}`)
  }

  await userModel.updateOne({ _id: id }, { $set: { is_delete: true } })
  res.redirect("/admin/users")
}

const trash = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = page * limit - limit
  const query = {}
  query.is_delete = true
  const users = await userModel
    .find(query)
    .sort({ role: 1, full_name: 1 })
    .limit(limit)
    .skip(skip)

  const totalRows = await userModel.find(query).countDocuments()
  const totalPages = Math.ceil(totalRows / limit)

  const user = await userModel.findOne({ email: req.session.email })
  const role = user?.role

  res.render('admin/users/trash_user', {
    data: {
      users,
      currentPage: page,
      totalPages,
      pages: paginate(page, totalPages)
    },
    role
  })
}

const trashRestore = async (req, res) => {
  const { id } = req.params
  await userModel.updateOne({ _id: id }, { $set: { is_delete: false } })
  res.redirect('/admin/users/trash')
}

const trashDel = async (req, res) => {
  const { id } = req.params
  await userModel.deleteOne({ _id: id })
  res.redirect('/admin/users/trash')
}

module.exports = {
  index,
  create,
  store,
  edit,
  update,
  del,
  trash,
  trashRestore,
  trashDel
}
