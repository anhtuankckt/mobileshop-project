const userModel = require('../apps/models/userModel')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const passport = require('passport')
const config = require('config')
const { v4: uuidv4 } = require('uuid')
const bcryptjs = require('bcryptjs')

passport.use(new GoogleStrategy({
  clientID: config.get('social.google.client_id'),
  clientSecret: config.get('social.google.client_secret'),
  callbackURL: "/admin/auth/google/callback"
},
  async function (accessToken, refreshToken, profile, cb) {
    const tokenLogin = uuidv4()
    profile.tokenLogin = tokenLogin
    // Check profile
    if (profile) {
      const userExists = await userModel.findOne({ email: profile.emails[0].value })
      if (userExists) {
        // Nếu tìm có email rồi
        if (!userExists.google_id) {
          await userModel.updateOne({ email: userExists.email }, {
            $set: { google_id: profile?.id }
          })
        }
        await userModel.updateOne({ email: userExists.email }, { $set: { tokenLogin } })
      } else {
        // Nếu chưa có email thì tạo mới account
        const hashedPassword = await bcryptjs.hash(tokenLogin, 10)
        const newUser = {
          email: profile?.emails[0].value,
          password: hashedPassword,
          full_name: profile?.displayName,
          google_id: profile?.id,
          confirmed: true,
          tokenLogin
        }
        await new userModel(newUser).save()
      }
    }
    return cb(null, profile)
  }
))

passport.use(new FacebookStrategy({
  clientID: config.get('social.facebook.client_id'),
  clientSecret: config.get('social.facebook.client_secret'),
  callbackURL: "/admin/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'emails']
},
  async function (accessToken, refreshToken, profile, cb) {
    const tokenLogin = uuidv4()
    profile.tokenLogin = tokenLogin
    if (profile) {
      const userExists = await userModel.findOne({ email: profile.emails[0].value })
      if (userExists) {
        // Nếu tìm có email rồi
        if (!userExists.facebook_id) {
          await userModel.updateOne({ email: userExists.email }, {
            $set: { facebook_id: profile?.id }
          })
        }
        await userModel.updateOne({ email: userExists.email }, { $set: { tokenLogin } })
      } else {
        // Nếu chưa có email thì tạo mới account
        let emailCustom
        if (!profile?.emails[0].value) {
          emailCustom = `${tokenLogin}@gmail.com`
        } else {
          emailCustom = profile?.emails[0].value
        }
        const hashedPassword = await bcryptjs.hash(tokenLogin, 10)
        const newUser = {
          email: emailCustom,
          password: hashedPassword,
          full_name: profile?.displayName,
          facebook_id: profile?.id,
          confirmed: true,
          tokenLogin
        }
        await new userModel(newUser).save()
      }
    }
    return cb(null, profile)
  }
))