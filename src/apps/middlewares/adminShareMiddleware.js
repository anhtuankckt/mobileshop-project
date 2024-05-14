const config = require('config')

module.exports = async (req, res, next) => {
  res.locals.adminEmail = req.session.email

  res.locals.baseUrlImage = config.get('app.baseUrlImage')
  next()
}