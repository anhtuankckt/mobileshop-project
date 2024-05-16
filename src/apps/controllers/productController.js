const productModel = require('../models/productModel')
const categoryModel = require('../models/categoryModel')
const commentModel = require('../models/commentModel')
const paginate = require('../../common/paginate')
const vndPrice = require('../../libs/vndPrice')
const slug = require('slug')
const path = require('path')
const userModel = require('../models/userModel')
const { s3, bucketName } = require('../configs/awsConfig')
const crypto = require('crypto')

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
    if (thumbnails.length > 5) {
      const error = 'Thêm tối đa 5 ảnh sản phẩm!'
      return res.render('admin/products/add_product', { categories, data: { error } })
    }
    // Kiểm tra ảnh
    const isImage = (fileName) => {
      const imageExtensions = ['.jpg', '.jpeg', '.png']
      const ext = path.extname(fileName).toLowerCase()
      return imageExtensions.includes(ext)
    }

    if (thumbnails.length > 0 && thumbnails.length <= 6) {
      const arrThumbnail = []

      for (let item of thumbnails) {
        if (!isImage(item.originalname)) {
          const error = 'File được thêm không phải là ảnh!'
          return res.render('admin/products/add_product', { categories, data: { error } })
        }

        const random = (bytes = 8) => crypto.randomBytes(bytes).toString('hex')
        const fileName = `products/${random()}_${item.originalname}`

        const params = {
          Bucket: bucketName,
          Key: fileName,
          Body: item.buffer,
          ContentType: item.mimetype
        }

        try {
          await s3.upload(params).promise()
          arrThumbnail.push(fileName)
        } catch (err) {
          console.error(err);
          const error = 'Error uploading file to S3!';
          return res.render('admin/products/add_product', { categories, data: { error } });
        }
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
    if (thumbnails.length > 5) {
      const error = 'Thêm tối đa 5 ảnh sản phẩm!'
      return res.render('admin/products/edit_product', { product: productExists, categories, data: { error } })
    }
    // Kiểm tra ảnh
    const isImage = (fileName) => {
      const imageExtensions = ['.jpg', '.jpeg', '.png']
      const ext = path.extname(fileName).toLowerCase()
      return imageExtensions.includes(ext)
    }

    if (thumbnails.length > 0 && thumbnails.length <= 6) {
      const arrThumbnail = []

      const thumbnailsExists = productExists?.thumbnails
      if (thumbnailsExists) {
        for (let fileName of thumbnailsExists) {
          const params = {
            Bucket: bucketName,
            Key: fileName
          }

          try {
            await s3.deleteObject(params).promise()
          } catch (err) {
            console.error(err)
            throw new Error('Error deleting file from S3!')
          }
        }
      }

      for (let item of thumbnails) {
        if (!isImage(item.originalname)) {
          const error = 'File được thêm không phải là ảnh!'
          return res.render('admin/products/edit_product', { product: productExists, categories, data: { error } })
        }

        const random = (bytes = 8) => crypto.randomBytes(bytes).toString('hex')
        const fileName = `products/${random()}_${item.originalname}`

        const params = {
          Bucket: bucketName,
          Key: fileName,
          Body: item.buffer,
          ContentType: item.mimetype
        }

        try {
          await s3.upload(params).promise()
          arrThumbnail.push(fileName)
        } catch (err) {
          console.error(err)
          const error = 'Error uploading file to S3!'
          return res.render('admin/products/edit_product', { product: productExists, categories, data: { error } })
        }

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

  const imageDefault = [
    'products/iPhone-7-Plus-32GB-Rose-Gold.png',
    'products/iPhone-X-256GB-Silver-Seedstock.png',
    'products/iPhone-Xr-2-Sim-64GB-Yellow.png',
    'products/iPhone-Xr-2-Sim-256GB-Red.png',
    'products/iPhone-Xs-256GB-Gold.png',
    'products/Nokia-1-red.png',
    'products/Nokia-3.1-Black.png',
    'products/Nokia-6.1-Plus-Blue.png',
    'products/Nokia-6.1-Plus-White.png',
    'products/Nokia-150-White.png',
    'products/OPPO-A3s–16GB-Red.png',
    'products/OPPO-A7-64GB-Blue.png',
    'products/OPPO-F7-128GB-Black.png',
    'products/OPPO-F9-Sunrise-Red.png',
    'products/OPPO-R17-Pro-Lavender.png',
    'products/Samsung-Galaxy-A9-2018-Black.png',
    'products/Samsung-Galaxy-J2-Core-Gold.png',
    'products/Samsung-Galaxy-J4-Core-Black.png',
    'products/Samsung-Galaxy-S9-Plus-64GB-Orchid-Gray.png',
    'products/Samsung-Galaxy-S9-Plus-Black-128GB.png',
    'products/Vivo-V7-Gold.png',
    'products/Vivo-V9-Gold.png',
    'products/Vivo-Y53C-Gold.png',
    'products/Vivo-Y69-Gold.png',
    'products/Vivo-Y81i-Red.png',
    'products/Xiaomi-Mi-8-Pro-Black.png',
    'products/Xiaomi-Mi-A1-Black.png',
    'products/Xiaomi-Mi-A1-Gold.png',
    'products/Xiaomi-Mi-Max-3-Ram-4–64GB-Black.png',
    'products/Xiaomi-Mi-Max-3-Ram-4â64GB-Black.png',
    'products/Xiaomi-Redmi-Note-6-Pro–32GB-Blue.png',
    'products/Xiaooooomi-Redmi-Note-6-Proâ32GB.png'
  ]

  for (let id of arrayIds) {
    const product = await productModel.findById(id)
    // Xoác các comment có prd_id là id
    await commentModel.deleteMany({ prd_id: id })

    const thumbnails = product?.thumbnails

    if (thumbnails) {
      for (let fileName of thumbnails) {
        const params = {
          Bucket: bucketName,
          Key: !imageDefault.includes(fileName) ? fileName : 'random'
        }

        try {
          await s3.deleteObject(params).promise()
        } catch (err) {
          console.error(err)
          throw new Error('Error deleting file from S3!')
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
