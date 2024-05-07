module.exports = {
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: process.env.MAIL_PORT || 587,
  secure: false,
  user: process.env.MAIL_USER || 'quantri.vietproshop@gmail.com',
  pass: process.env.MAIL_PASS || 'tjpj rclg ithn rkby'
}