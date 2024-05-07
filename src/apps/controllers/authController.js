const userModel = require('../models/userModel')
const transporter = require('../../common/transporter')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')

const signup = async (req, res) => {
  res.render('admin/signup', { data: {} })
}

const postSignup = async (req, res) => {
  const { full_name, email, password, confirmPassword } = req.body

  if (!email.trim() || !password.trim() || !password.trim() || !confirmPassword.trim()) {
    const error = 'Các trường nhập vào không được để trống!'
    return res.render('admin/signup', {
      data: { error }
    })
  }

  if (password !== confirmPassword) {
    const error = 'Mật khẩu nhập vào không khớp!'
    return res.render('admin/signup', { data: { error } })
  }

  if (/\s/.test(email) || /\s/.test(password) || /\s/.test(confirmPassword)) {
    const error = 'Email, password không chứa khoảng trắng!'
    return res.render('admin/signup', { data: { error } })
  }

  if (password.length < 6 || full_name.length < 6 || email.length < 6) {
    const error = 'Các trường nhập phải ít nhất 5 kí tự!'
    return res.render('admin/signup', { data: { error } })
  }

  const existsEmail = await userModel.findOne({ email: { $regex: new RegExp(email, 'i') } })

  if (existsEmail) {
    const error = 'Email đăng kí đã tồn tại!'
    return res.render('admin/signup', { data: { error } })
  }

  const hashedPassword = await bcryptjs.hash(password, 10)

  const newUser = new userModel({
    full_name,
    email,
    password: hashedPassword
  })

  await newUser.save()

  const token = jwt.sign({ id: newUser._id }, config.get('app.tokenSecretSignup'), { expiresIn: '365d' })
  const url = `http://localhost:3000/admin/signup/verification/${newUser._id}/${token}`

  // send mail with defined transport object
  await transporter.sendMail({
    from: '"MobileShop 👻" mobileshop@gmail.com', // sender address
    to: email, // list of receivers
    subject: "MobileShop - Verification account ✔", // Subject line
    text: `Hãy click vào link để xác thực tài khoản: ${url}`
  });

  res.redirect('/admin/signup/success')
}

const getSignupSuccess = async (req, res) => {
  res.render('admin/signup_success')
}

const verificationForSingup = async (req, res) => {
  const { id, token } = req.params

  jwt.verify(token, config.get('app.tokenSecretSignup'), async (error, decoded) => {
    if (error) {
      // Xử lý lỗi khi verify JWT
      if (error instanceof jwt.TokenExpiredError) {
        const expiredError = 'Token đã hết hạn. Vui lòng thử lại!';
        return res.render('admin/signup', { data: { error: expiredError } });
      } else {
        const otherError = 'Lỗi token!';
        return res.render('admin/signup', { data: { error: otherError } });
      }
    } else {
      // Không có lỗi, tiếp tục với việc cập nhật và chuyển hướng
      await userModel.updateOne({ _id: id }, { $set: { confirmed: true } });
      return res.render('admin/signup_verification_success')
    }
  })
}

const getLogin = async (req, res) => {
  res.render("admin/login", { data: {} })
}

const postLogin = async (req, res) => {
  const { email, password, remember } = req.body

  if (!email.trim() || !password.trim()) {
    const error = 'Không để trống email, password!'
    return res.render('admin/login', {
      data: { error }
    })
  }

  const emailExists = await userModel.findOne({ email: { $regex: new RegExp(email, 'i') } })

  if (!emailExists) {
    const error = 'Email không tồn tại!'
    return res.render('admin/login', {
      data: { error }
    })
  }

  if (emailExists.is_delete) {
    const error = 'Tài khoản của bạn đã bị xóa!'
    return res.render('admin/login', {
      data: { error }
    })
  }

  const isMatch = await bcryptjs.compare(password, emailExists.password)

  if (!isMatch) {
    const error = 'Password không chính xác!'
    return res.render('admin/login', {
      data: { error }
    })
  }

  // Kiểm tra xác thực email
  if (!emailExists.confirmed) {
    const error = 'Email chưa được xác thực mật khẩu! Hãy xác thực hoặc đăng nhập bằng Google, Facebook!'
    return res.render('admin/login', {
      data: { error }
    })
  }
  // Ghi nhớ tài khoản, mật khẩu
  if (remember) {
    res.cookie('savedEmail', email, { maxAge: 3600000 })
  } else {
    res.clearCookie('savedEmail')
  }

  req.session.email = emailExists.email
  req.session.password = emailExists.password

  res.redirect('/admin/login/success')
}

const logout = (req, res) => {
  req.session.destroy()
  res.clearCookie('savedEmail')
  res.redirect("/admin/login")
}

const loginSuccess = async (req, res) => {
  res.render('admin/login_success')
}

const getForgotPassword = async (req, res) => {
  res.render('admin/auth/forgot_password', { data: {} })
}

const postForgotPassword = async (req, res) => {
  const { email } = req.body
  const user = await userModel.findOne({ email: email })
  if (!user) {
    const error = 'Email không chính xác!'
    return res.render('admin/auth/forgot_password', { data: { error } })
  }

  const token = jwt.sign({ id: user?.id }, config.get('app.tokenSecretForgotPassword'), { expiresIn: '1m' })

  // send mail with defined transport object
  await transporter.sendMail({
    from: '"MobileShop 👻" mobileshop@gmail.com', // sender address
    to: email, // list of receivers
    subject: "MobileShop - Forgot Password ✔", // Subject line
    text: `http://localhost:3000/admin/reset-password/${user._id}/${token}`
  });

  res.redirect('/admin/login')
}

const getForgotPasswordSuccess = async (req, res) => {
  res.render('admin/auth/forgot_password_success', { data: {} })
}

const getResetPassword = async (req, res) => {
  const { id } = req.params
  const user = await userModel.findById(id)

  res.render('admin/auth/reset_password', { data: {}, user })
}

const postResetPassword = async (req, res) => {
  const { id, token } = req.params
  const { password, confirmPassword } = req.body
  const user = await userModel.findById(id)

  if (!password.trim() || !confirmPassword.trim()) {
    const error = 'Không để trống password!'
    return res.render('admin/auth/reset_password', { data: { error }, user })
  }

  if (password !== confirmPassword) {
    const error = 'Password không khớp!'
    return res.render('admin/auth/reset_password', { data: { error }, user })
  }

  if (/\s/.test(password) || /\s/.test(confirmPassword)) {
    const error = 'Password không được chứa khoảng trắng'
    return res.render('admin/auth/reset_password', { data: { error }, user })
  }

  if (password.length < 6 || confirmPassword.length < 6) {
    const error = 'Password từ 6 kí tự trở lên!'
    return res.render('admin/auth/reset_password', { data: { error }, user })
  }

  const hashedPassword = await bcryptjs.hash(password, 10)

  const resetPassword = {
    password: hashedPassword
  }

  jwt.verify(token, config.get('app.tokenSecretForgotPassword'), async (error, decoded) => {
    if (error) {
      // Xử lý lỗi khi verify JWT
      if (error instanceof jwt.TokenExpiredError) {
        const expiredError = 'Token đã hết hạn. Vui lòng thử lại!';
        return res.render('admin/auth/reset_password', { data: { error: expiredError }, user });
      } else {
        const otherError = 'Quên mật khẩu và nhập lại!';
        return res.render('admin/auth/reset_password', { data: { error: otherError }, user });
      }
    } else {
      // Không có lỗi, tiếp tục với việc cập nhật mật khẩu và chuyển hướng
      await userModel.updateOne({ _id: id }, { $set: resetPassword });
      res.redirect('/admin/login');
    }
  })
}

/** GOOOGLE - FACEBOOK */
const loginGoogle = async (req, res) => {
  const { google_id, tokenLogin } = req?.params
  const user = await userModel.findOne({ google_id, tokenLogin })
  if (!user) {
    const error = "Tài khoản không chính xác!"
    res.render("admin/login", { data: { error } })
  }
  req.session.email = user.email
  req.session.password = user.password
  return res.redirect('/admin/login/success')
}

const loginFacebook = async (req, res) => {
  const { facebook_id, tokenLogin } = req?.params
  const user = await userModel.findOne({ facebook_id, tokenLogin })
  if (!user) {
    const error = "Tài khoản không chính xác!"
    res.render("admin/login", { data: { error } })
  }
  req.session.email = user.email
  req.session.password = user.password
  return res.redirect('/admin/login/success')
}

module.exports = {
  getLogin,
  postLogin,
  signup,
  postSignup,
  logout,
  getForgotPassword,
  postForgotPassword,
  getForgotPasswordSuccess,
  getResetPassword,
  postResetPassword,
  logout,
  loginGoogle,
  getSignupSuccess,
  verificationForSingup,
  loginFacebook,
  loginSuccess
}
