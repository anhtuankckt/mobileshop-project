module.exports = async (req, res, next) => {
  res.locals.adminEmail = req.session.email

  next()
}