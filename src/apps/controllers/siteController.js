const productModel = require('../models/productModel')
const commentModel = require('../models/commentModel')
const categoryModel = require('../models/categoryModel')
const customerModel = require('../models/customerModel')
const orderModel = require('../models/orderModel')
const paginate = require('../../common/paginate')
const vndPrice = require('../../libs/vndPrice')
const timesAgo = require('../../libs/timesAgo')
const transporter = require('../../common/transporter')
const ejs = require('ejs')
const path = require('path')
const bcryptjs = require('bcryptjs')
const config = require('config')

const home = async (req, res) => {
  const featured = await productModel
    .find({ featured: true, is_delete: false })
    .sort({ _id: -1 })
    .limit(6)

  const latest = await productModel.find({ is_delete: false })
    .sort({ _id: -1 })
    .limit(6)

  res.render('site/home', {
    featured,
    latest,
    vndPrice
  })
}

const category = async (req, res) => {
  const { id } = req.params
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 12
  const skip = page * limit - limit
  const query = {}
  query.cat_id = id
  query.is_delete = false
  const products = await productModel.find(query).sort({ _id: -1 }).limit(limit).skip(skip)

  const totalRows = await productModel.find(query).countDocuments()
  const totalPages = Math.ceil(totalRows / limit)

  const category = await categoryModel.findById(id)

  res.render('site/category', {
    products,
    currentPage: page,
    totalPages,
    totalRows,
    pages: paginate(page, totalPages),
    vndPrice,
    category
  })
};

const product = async (req, res) => {
  const { id } = req.params
  const { commentId } = req.query
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = page * limit - limit
  const product = await productModel.findById(id)

  if (!product) res.redirect('/')

  const query = {
    prd_id: id,
    allow: true
  }

  const comments = await commentModel.find(query).sort({ _id: -1 }).skip(skip).limit(limit)

  const totalRows = await commentModel.find(query).countDocuments()
  const totalPages = Math.ceil(totalRows / limit)

  const parrentComments = comments.filter(i => i.parrent_comment_id === null)

  let childComments = []
  for (let comment of parrentComments) {
    const parrent = await commentModel.findById(comment.id)
    const commentss = await commentModel.find({
      prd_id: id,
      left: { $gt: parrent?.left },
      right: { $lte: parrent?.right },
      allow: true,
      parrent_comment_id: comment.id
    })
    childComments.push(...commentss)
  }

  res.render('site/product', {
    id,
    commentId,
    parrentComments,
    childComments,
    timesAgo,
    product,
    vndPrice,
    currentPage: page,
    totalPages,
    pages: paginate(page, totalPages)
  })
}

const comment = async (req, res) => {
  const { id } = req.params
  const { full_name, email, body, commentId } = req.body

  const badWord = /dit|địt|lồn|buồi|cặc|dái|d!t|đái|lôn/gi

  const newBody = body.replace(badWord, '***')

  const comment = new commentModel({
    prd_id: id,
    full_name,
    email,
    body: newBody,
    parrent_comment_id: commentId
  })

  let rightValue

  if (commentId) {
    const parrentComment = await commentModel.findById(commentId)

    rightValue = parrentComment.right

    await commentModel.updateMany({
      prd_id: id,
      right: { $gte: rightValue }
    }, { $inc: { right: 2 } })

    await commentModel.updateMany({
      prd_id: id,
      left: { $gt: rightValue }
    }, { $inc: { left: 2 } })
  } else {
    const maxRightValue = await commentModel.findOne({ prd_id: id }).sort({ right: -1 })

    if (maxRightValue) {
      rightValue = maxRightValue.right + 1
    } else {
      rightValue = 1
    }
  }

  comment.left = rightValue
  comment.right = rightValue + 1

  const params = new URLSearchParams({
    secret: config.get('recaptcha.secret_key'),
    response: req.body['g-recaptcha-response']
  })

  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    body: params
  })

  const data = await response.json()

  if (data.success === true) {
    await comment.save()
    res.redirect(`/product/${id}`)
  } else {
    const errorReCAPTCHA = 'Kiểm tra lại CAPTCHA'
    res.redirect(`/product/${id}?errorReCAPTCHA=${errorReCAPTCHA}`)
  }
}

const nameProducts = async (req, res) => {
  const products = await productModel.find({ is_stock: true })
  const nameProducts = products.map(i => i.name)

  res.json({ nameProducts })
}

const search = async (req, res) => {
  const { keyword } = req.query
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 12
  const skip = page * limit - limit

  // Tìm kiếm tương đối
  let query = {}
  // Tách keyword nhận được thành các từ riêng lẻ
  const words = keyword.trim().split(/\s+/)

  // Nối chuỗi bằng join | có dạng regex pattern để search
  const regexPattern = words.join('|')

  // Nếu có từ khóa thì name tìm theo dạng regex, nếu không thì null
  if (regexPattern.length > 0) {
    query.name = { $regex: new RegExp(regexPattern, 'i') }
  } else {
    query.name = null
  }

  const products = await productModel.find(query).skip(skip).limit(limit)
  const totalRows = await productModel.countDocuments(query)
  const totalPages = Math.ceil(totalRows / limit)

  // Sắp xếp lại sản phẩm theo số lượng từ khóa khớp - giảm dần
  const countMatches = (name, words) => {
    let count = 0
    words.forEach((word) => {
      if (new RegExp(word, 'i').test(name)) {
        count++
      }
    })
    return count
  }

  products.sort((a, b) => {
    const aCount = countMatches(a.name, words)
    const bCount = countMatches(b.name, words)
    return bCount - aCount
  })

  res.render('site/search', {
    products,
    currentPage: page,
    totalPages,
    keyword,
    pages: paginate(page, totalPages),
    vndPrice
  })
}

const addToCart = async (req, res) => {
  const { id, qty } = req.body
  let items = req.session.cart
  let isProductExitst = false

  const newItems = items.map((item) => {
    if (item.id === id) {
      item.qty += Number(qty)
      isProductExitst = true
    }
    return item
  })

  if (!isProductExitst) {
    const product = await productModel.findById(id)
    newItems.push({
      id,
      name: product?.name,
      price: product?.price,
      thumbnails: product?.thumbnails,
      qty: Number(qty)
    })
  }

  req.session.cart = newItems
  res.redirect('/cart')
}

const cart = async (req, res) => {
  const items = req.session.cart
  const totalPriceCart = items.reduce((total, item) => total + item.price * item.qty, 0)

  res.render('site/cart', {
    items,
    vndPrice,
    totalPriceCart
  })
}

const updateCart = (req, res) => {
  const { products } = req.body
  const items = req.session.cart
  const newItems = items.map((item) => {
    if (products[item.id]) {
      item.qty = Number(products[item.id]['qty'])
    }
    return item
  })

  req.session.cart = newItems
  res.redirect('/cart')
}

const deleteCart = (req, res) => {
  const { id } = req.params
  const items = req.session.cart
  const newItems = items.filter((item) => item.id !== id)

  req.session.cart = newItems
  res.redirect('/cart')
}

const order = async (req, res) => {
  const { id } = req.params
  const items = req.session.cart

  const customer = await customerModel.findById(id)

  const newOrder = new orderModel({})

  if (customer && items.length > 0) {
    newOrder.customer_id = customer._id
    newOrder.items = items.map((item) => ({
      prd_id: item.id,
      price: item.price,
      qty: item.qty
    }))
  }

  const infoCustomer = {
    name: customer.username,
    phone: customer.phone,
    add: customer.address
  }

  const viewFolder = req.app.get('views')
  const html = await ejs.renderFile(path.join(viewFolder, 'site/mail_order.ejs'), {
    ...infoCustomer,
    items,
    vndPrice
  })

  // send mail with defined transport object
  await transporter.sendMail({
    from: '"MobileShop 👻" mobileshop@gmail.com', // sender address
    to: customer.email, // list of receivers
    subject: "MobileShop xác nhận đơn hàng thành công ✔", // Subject line
    html // html body
  });

  newOrder.save()
  req.session.cart = []
  res.redirect('/success')
}

const success = async (req, res) => {
  const { orderError } = req.query
  res.render('site/success', { orderError })
}

const successList = async (req, res) => {
  const { id } = req.params
  const query = {}
  query.confirmed = false
  query.customer_id = id

  const orders = await orderModel.find(query)
    .populate('items.prd_id')
    .sort({ _id: -1 })

  const newQuery = {}
  newQuery.confirmed = true
  newQuery.customer_id = id

  const newOrders = await orderModel.find(newQuery)
    .populate('items.prd_id')
    .sort({ _id: -1 })

  res.render('site/success_list', {
    orders,
    newOrders,
    vndPrice
  })
}

const signup = async (req, res) => {
  res.render('site/customers/signup', { data: {} })
}

const postSignup = async (req, res) => {
  const { username, email, phone, address, password, confirmPassword } = req.body

  if (!email.trim() || !password.trim() || !password.trim() || !confirmPassword.trim() || !phone.trim() || !address.trim()) {
    const error = 'Không để trống các trường!'
    return res.render('site/customers/signup', {
      data: { error }
    })
  }

  if (password !== confirmPassword) {
    const error = 'Mật khẩu nhập vào không khớp!'
    return res.render('site/customers/signup', { data: { error } })
  }

  if (/\s/.test(username) || /\s/.test(email) || /\s/.test(password) || /\s/.test(confirmPassword) || /\s/.test(phone)) {
    const error = 'Các trường nhập vào không chứa khoảng trắng!'
    return res.render('site/customers/signup', { data: { error } })
  }

  if (password.length < 6 || username.length < 6 || email.length < 6 || phone.length < 6 || address.length < 6) {
    const error = 'Các trường nhập phải ít nhất 5 kí tự!'
    return res.render('site/customers/signup', { data: { error } })
  }

  const existsEmail = await customerModel.findOne({ email: { $regex: new RegExp(email, 'i') } })

  if (existsEmail) {
    const error = 'Email đăng kí đã tồn tại!'
    return res.render('site/customers/signup', { data: { error } })
  }

  const hashedPassword = await bcryptjs.hash(password, 10)

  const newUser = new customerModel({
    username,
    email,
    phone,
    address,
    password: hashedPassword
  })

  await newUser.save()
  res.redirect('/signin')
}

const signin = async (req, res) => {
  const savedEmailSite = req.cookies.savedEmailSite
  if (savedEmailSite) {
    const customer = await customerModel.findOne({ email: savedEmailSite })
    if (customer) {
      req.session.customerEmail = savedEmailSite
      return res.redirect('/')
    }
  }
  res.render('site/customers/signin', { data: {} })
}

const postSignin = async (req, res) => {
  const { email, password, remember } = req.body

  const existsEmail = await customerModel.findOne({ email: { $regex: new RegExp(email, 'i') } })

  if (!email.trim() || !password.trim()) {
    const error = 'Không để trống email, password!'
    return res.render('site/customers/signin', { data: { error } })
  }

  if (!existsEmail) {
    const error = 'Email không tồn tại!'
    return res.render('site/customers/signin', { data: { error } })
  }

  const isMatch = await bcryptjs.compare(password, existsEmail.password)

  if (!isMatch) {
    const error = 'Password không chính xác!'
    return res.render('site/customers/signin', { data: { error } })
  }

  // Ghi nhớ tài khoản, mật khẩu
  if (remember) {
    res.cookie('savedEmailSite', email, { maxAge: 3600000 })
  } else {
    res.clearCookie('savedEmailSite')
  }

  req.session.customerEmail = email
  const cart = req.session.cart
  if (cart.length > 0) {
    res.redirect('/cart')
  } else {
    res.redirect('/')
  }
}

const logout = async (req, res) => {
  delete req.session.customerEmail
  res.clearCookie('savedEmailSite')
  res.redirect('/')
}

module.exports = {
  home,
  category,
  product,
  comment,
  search,
  addToCart,
  cart,
  updateCart,
  deleteCart,
  order,
  success,
  successList,
  signin,
  signup,
  postSignup,
  postSignin,
  logout,
  nameProducts
}
