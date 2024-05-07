require("dotenv").config()

module.exports = {
  app: require("./app"),
  db: require("./db"),
  mail: require('./mail'),
  recaptcha: require('./recaptcha'),
  social: require('./social')
}
