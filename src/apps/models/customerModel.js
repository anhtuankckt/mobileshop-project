const mongoose = require('../../common/database')()

const customerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  member: {
    type: String,
    default: 'member'
    // member, loyal, VIP
  },
}, { timestamps: true }
)

const customerModel = mongoose.model("Customer", customerSchema, "customers")

module.exports = customerModel
