const productModel = require('../models/productModel')
const categoryModel = require('../models/categoryModel')
const userModel = require('../models/userModel')
const paginate = require('../../common/paginate')
const slug = require('slug')

const index = async (req, res) => {
  const query = {}
  query.is_delete = false
  const categories = await categoryModel.find(query).populate('cat_parrent')

  const user = await userModel.findOne({ email: req.session.email })
  const role = user?.role

  res.render('admin/categories/category', { categories, role })
}

const create = async (req, res) => {
  const { cat_parrent } = req.query
  const query = {}
  query.is_delete = false
  const categories = await categoryModel.find(query)

  res.render("admin/categories/add_category", { data: { cat_parrent }, categories })
}

const store = async (req, res) => {
  const { cat_parrent, title } = req.body
  const query = {}
  query.is_delete = false
  const categories = await categoryModel.find(query)
  const categoryExists = await categoryModel.findOne({
    $and: [
      { title: { $regex: new RegExp('^' + title + '$', "i") } },
      { cat_parrent: null }
    ]
  })

  if (title.length < 2) {
    const error = "Danh mục có ít nhất 2 kí tự!";
    return res.render("admin/categories/add_category", {
      data: { error },
      categories
    })
  }

  if (categoryExists) {
    const error = "Danh mục đã gốc tồn tại !";
    return res.render("admin/categories/add_category", {
      data: { error },
      categories
    })
  }

  const newCategory = new categoryModel({
    title,
    slug: slug(title),
  })

  let rightValue
  if (cat_parrent !== 'khong') {
    newCategory.cat_parrent = cat_parrent
    const category = await categoryModel.findById(cat_parrent)
    rightValue = category.right
    await categoryModel.updateMany({ left: { $gt: rightValue } }, { $inc: { left: 2 } })
    await categoryModel.updateMany({ right: { $gte: rightValue } }, { $inc: { right: 2 } })
  } else {
    const categoryMaxRight = await categoryModel.findOne().sort({ right: -1 })
    if (categoryMaxRight) {
      rightValue = categoryMaxRight.right + 1
    } else {
      rightValue = 1
    }
  }

  newCategory.left = rightValue
  newCategory.right = rightValue + 1

  await newCategory.save()
  res.redirect('/admin/categories')
}

const edit = async (req, res) => {
  const { id } = req.params
  const query = {}
  query.is_delete = false
  const categories = await categoryModel.find(query)
  const currentCategory = await categoryModel.findById(id).populate({ path: 'cat_parrent' })

  res.render("admin/categories/edit_category", {
    data: {},
    categories,
    currentCategory
  })
}

const update = async (req, res) => {
  const { id } = req.params
  const { title, cat_parrent } = req.body
  const query = {}
  query.is_delete = false
  const categories = await categoryModel.find(query)
  const currentCategory = await categoryModel.findById(id).populate({ path: 'cat_parrent' })
  const categoryExists = await categoryModel.findOne({
    $and: [
      { title: { $regex: new RegExp('^' + title + '$', "i") } },
      { cat_parrent: null }
    ]
  })

  if (title.length < 4) {
    const error = "Danh mục có ít nhất 4 kí tự!";
    return res.render("admin/categories/edit_category", {
      data: { error },
      categories,
      currentCategory
    })
  }

  if (categoryExists) {
    const error = "Không được trùng danh mục gốc";
    return res.render("admin/categories/edit_category", {
      data: { error },
      categories,
      currentCategory
    })
  }

  const updateCategory = { title, slug: slug(title) }

  let leftValue
  let rightValue

  if (!cat_parrent) {
    await categoryModel.updateOne({ _id: id }, { $set: updateCategory })
    return res.redirect("/admin/categories")
  } else {
    const category = await categoryModel.findById(id)
    leftValue = category.left
    await categoryModel.updateMany({ left: { $gte: leftValue } }, { $inc: { left: -2 } })
    await categoryModel.updateMany({ right: { $gt: leftValue } }, { $inc: { right: -2 } })

    if (cat_parrent !== 'khong') {
      updateCategory.cat_parrent = cat_parrent
      const categoryParrent = await categoryModel.findById(cat_parrent)

      rightValue = categoryParrent.right

      await categoryModel.updateMany({ left: { $gt: rightValue } }, { $inc: { left: 2 } })
      await categoryModel.updateMany({ right: { $gte: rightValue } }, { $inc: { right: 2 } })
    } else {
      updateCategory.cat_parrent = null
      const category = await categoryModel.findOne(query).sort({ right: -1 })
      if (category) {
        rightValue = category.right + 1
      } else {
        rightValue = 1
      }
    }
  }

  updateCategory.left = rightValue
  updateCategory.right = rightValue + 1

  await categoryModel.updateOne({ _id: id }, { $set: updateCategory })
  res.redirect("/admin/categories")
}

/** XÓA MỀM 1 CATEGORY */
const del = async (req, res) => {
  const { id } = req.params
  const category = await categoryModel.findById(id)

  const categories = await categoryModel.find({
    left: { $gte: category.left },
    right: { $lte: category.right }
  })

  const arrIds = categories.map(i => i._id.toString())
  // Xóa category có id nằm trong mảng left và right id được lấy
  await categoryModel.updateMany({ _id: { $in: arrIds } }, { $set: { is_delete: true } })
  // Xóa category thì sẽ xóa luôn product theo đó
  await productModel.updateMany({ cat_id: { $in: arrIds } }, { $set: { is_delete: true } })

  res.redirect('/admin/categories')
}

const trash = async (req, res) => {
  const query = {}
  query.is_delete = true
  const categories = await categoryModel.find(query)

  const user = await userModel.findOne({ email: req.session.email })
  const role = user?.role

  res.render("admin/categories/trash_category", {
    categories,
    role
  })
}

const trashRestore = async (req, res) => {
  const { id } = req.params
  await categoryModel.updateOne({ _id: id }, { $set: { is_delete: false } })
  res.redirect('/admin/categories/trash')
}

module.exports = {
  index,
  create,
  store,
  edit,
  update,
  del,
  trash,
  trashRestore
}
