const mongoose = require('../../common/database')()

const orderSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  items: [{
    prd_id: {
      type: mongoose.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    qty: {
      type: Number,
      required: true
    }
  }],
  confirmed: {
    type: Boolean,
    default: false
  },
  is_delete: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })


const orderModel = mongoose.model('Order', orderSchema, 'orders')

module.exports = orderModel
