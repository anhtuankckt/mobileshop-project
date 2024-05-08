const productModel = require('../models/productModel')
const categoryModel = require('../models/categoryModel')
const commentModel = require('../models/commentModel')
const paginate = require('../../common/paginate')
const vndPrice = require('../../libs/vndPrice')
const slug = require('slug')
const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const userModel = require('../models/userModel')

const index = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = page * limit - limit
  const query = {}
  query.is_delete = false
  if (req.query.filter) {
    query.cat_id = req.query.filter
  }

  const products = await productModel
    .find(query)
    .populate({ path: "cat_id" })
    .sort({ _id: -1 })
    .limit(limit)
    .skip(skip)

  const totalRows = await productModel.find(query).countDocuments()
  const totalPages = Math.ceil(totalRows / limit)

  const categories = await categoryModel.find({ is_delete: false }).populate('cat_parrent')

  const user = await userModel.findOne({ email: req.session.email })
  const role = user?.role

  res.render("admin/products/product", {
    data: {},
    products,
    vndPrice,
    currentPage: page,
    totalPages,
    pages: paginate(page, totalPages),
    categories,
    currentFilterCat: req.query.filter,
    role
  })
}

const create = async (req, res) => {
  const categories = await categoryModel.find({ is_delete: false }).populate('cat_parrent')

  res.render("admin/products/add_product", { categories, data: {} })
}

const store = async (req, res) => {
  const { body } = req
  const { thumbnails } = req.files
  const categories = await categoryModel.find({ is_delete: false }).populate('cat_parrent')

  if (!body.cat_id) {
    const error = 'Chưa có danh mục cấp 3. Hãy tạo mới trước khi thêm sản phẩm !'
    return res.render('admin/products/add_product', { categories, data: { error } })
  }

  const product = {
    name: body.name,
    price: body.price,
    cat_id: body.cat_id,
    status: body.status,
    featured: body.featured == "on",
    is_stock: body.is_stock == "1",
    warranty: body.warranty,
    accessories: body.accessories,
    promotion: body.promotion,
    description: body.description,
    slug: slug(body.name)
  }

  if (thumbnails) {
    if (thumbnails.length > 6) {
      const error = 'Thêm tối đa 6 ảnh sản phẩm!'
      return res.render('admin/products/add_product', { categories, data: { error } })
    }
    // Kiểm tra ảnh
    const isImage = (fileName) => {
      const imageExtensions = ['.jpg', '.jpeg', '.png']
      const ext = path.extname(fileName).toLowerCase()
      return imageExtensions.includes(ext)
    }

    if (thumbnails.length > 0 && thumbnails.length <= 6) {
      const random = uuidv4()
      const arrThumbnail = []

      let index = 1
      for (let item of thumbnails) {
        if (!isImage(item.originalname)) {
          const error = 'File được thêm không phải là ảnh!'
          return res.render('admin/products/add_product', { categories, data: { error } })
        }
        const fileName = `products/${index}_${random}_${item.originalname}`
        arrThumbnail.push(fileName)
        fs.renameSync(item.path, path.resolve('src/public/uploads/images', fileName))
        index++
      }

      product['thumbnails'] = arrThumbnail
    }

    await new productModel(product).save()
    res.redirect("/admin/products")
  }
}

const edit = async (req, res) => {
  const { id } = req.params
  const product = await productModel.findById(id)
  const categories = await categoryModel.find({ is_delete: false }).populate('cat_parrent')

  res.render("admin/products/edit_product", {
    product,
    categories,
    data: {}
  })
}

const update = async (req, res) => {
  const { id } = req.params
  const { body } = req
  const { thumbnails } = req.files

  const productExists = await productModel.findById(id)
  const categories = await categoryModel.find({ is_delete: false }).populate('cat_parrent')

  if (!body.cat_id) {
    const error = 'Chưa có danh mục cấp 3. Hãy tạo mới trước khi sửa sản phẩm !'
    return res.render('admin/products/edit_product', { product: productExists, categories, data: { error } })
  }

  const product = {
    name: body.name,
    price: body.price,
    cat_id: body.cat_id,
    status: body.status,
    featured: body.featured == "on",
    is_stock: body.is_stock == "1",
    warranty: body.warranty,
    accessories: body.accessories,
    promotion: body.promotion,
    description: body.description,
    slug: slug(body.name)
  }

  if (thumbnails) {
    if (thumbnails.length > 6) {
      const error = 'Thêm tối đa 6 ảnh sản phẩm!'
      return res.render('admin/products/add_product', { categories, data: { error } })
    }
    // Kiểm tra ảnh
    const isImage = (fileName) => {
      const imageExtensions = ['.jpg', '.jpeg', '.png']
      const ext = path.extname(fileName).toLowerCase()
      return imageExtensions.includes(ext)
    }

    if (thumbnails.length > 0 && thumbnails.length <= 6) {
      const random = uuidv4()
      const arrThumbnail = []

      let index = 1
      for (let item of thumbnails) {
        if (!isImage(item.originalname)) {
          const error = 'File được thêm không phải là ảnh!'
          return res.render('admin/products/add_product', { categories, data: { error } })
        }
        const fileName = `products/${index}_${random}_${item.originalname}`
        arrThumbnail.push(fileName)
        fs.renameSync(item.path, path.resolve('src/public/uploads/images', fileName))
        index++
      }

      product['thumbnails'] = arrThumbnail
    }

  }

  await productModel.updateOne({ _id: id }, { $set: product })
  res.redirect("/admin/products")
}

/** XÓA MỀM TẤT CẢ CÁC SẢN PHẨM ĐƯỢC CHỌN */
const del = async (req, res) => {
  // Mảng chứa các id của sản phẩm được chọn
  const { ids } = req.params
  const arrIds = ids.split(',')
  if (!arrIds) return res.redirect('/admin/products')

  const idsProduct = await productModel.find({ _id: { $in: arrIds } })
  if (!idsProduct || idsProduct.length === 0) {
    return res.redirect('/admin/products')
  }

  await productModel.updateMany({ _id: { $in: arrIds } }, { $set: { is_delete: true } })

  await commentModel.updateMany({ prd_id: { $in: arrIds } }, {
    $set: { allow: false, is_delete: false }
  })

  res.redirect('/admin/products')
}

const trash = async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = page * limit - limit
  const query = {}
  query.is_delete = true
  const products = await productModel
    .find(query)
    .populate({ path: "cat_id" })
    .sort({ _id: -1 })
    .limit(limit)
    .skip(skip)

  const totalRows = await productModel.find(query).countDocuments()
  const totalPages = Math.ceil(totalRows / limit)

  const { restoreError } = req.query

  const user = await userModel.findOne({ email: req.session.email })
  const role = user?.role

  res.render('admin/products/trash_product', {
    data: { restoreError },
    products,
    vndPrice,
    currentPage: page,
    totalPages,
    pages: paginate(page, totalPages),
    role
  })
}

const trashRestore = async (req, res) => {
  const { ids } = req.params
  const arrayIds = ids.split(',')

  for (let id of arrayIds) {
    const product = await productModel.findById(id).populate('cat_id')

    if (product?.cat_id?.is_delete === true) {
      const title = product?.cat_id?.title
      const restoreError = `Danh mục ${title} đang trong thùng rác. Hãy khôi phục trước!`
      return res.redirect(`/admin/products/trash?restoreError=${restoreError}`)
    }

    if (product?.cat_id?.is_delete === false) {
      await productModel.updateOne({ _id: id }, { $set: { is_delete: false } })
    }
  }

  res.redirect('/admin/products/trash')
}

/** Xóa cứng */
const trashDel = async (req, res) => {
  const { ids } = req.params
  const arrayIds = ids.split(',')
  if (!arrayIds) res.redirect('/admin/products/trash')

  for (let id of arrayIds) {
    const product = await productModel.findById(id)
    // Xoác các comment có prd_id là id
    await commentModel.deleteMany({ prd_id: id })

    const thumbnails = product?.thumbnails

    if (thumbnails) {
      for (let item of thumbnails) {
        const imageName = path.basename(item)
        const imagePathDir = path.resolve('src/public/uploads/images/products')
        const imagesWithSameName = fs.readdirSync(imagePathDir).filter(file => file === imageName)

        if (imagesWithSameName.length > 1) {
          const filePath = path.resolve('src/public/uploads/images', item)
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
          }
        }
      }
    }
  }

  await productModel.deleteMany({ _id: { $in: arrayIds } })
  res.redirect('/admin/products/trash')
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
