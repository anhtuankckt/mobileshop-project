const mongoose = require('../../common/database')()

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: 'member'
    },
    full_name: {
      type: String,
      required: true
    },
    confirmed: {
      type: Boolean,
      default: false
    },
    tokenLogin: {
      type: String,
      default: null
    },
    google_id: {
      type: String,
      default: null
    },
    facebook_id: {
      type: String,
      default: null
    },
    is_delete: {
      type: Boolean,
      default: false
    }
  }, { timestamps: true }
)

const userModel = mongoose.model("User", userSchema, "users")

module.exports = userModel
