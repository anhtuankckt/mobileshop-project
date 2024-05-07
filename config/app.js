module.exports = {
  port: process.env.SERVER_PORT || 3000,
  staticFolder: `${__dirname}/../src/public`,
  viewsFolder: `${__dirname}/../src/apps/views`,
  viewEngine: "ejs",
  sessionKey: process.env.SESSION_KEY,
  sessionSecure: false,
  tmp: `${__dirname}/../src/tmp`,
  tokenSecretForgotPassword: process.env.TOKEN_SECRET_FORGOT_PASSWORD,
  tokenSecretSignup: process.env.TOKEN_SECRET_SIGNUP
}
