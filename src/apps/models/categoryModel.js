const mongoose = require('../../common/database')()

const categorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  left: {
    type: Number,
    default: 0
  },
  right: {
    type: Number,
    default: 0
  },
  cat_parrent: {
    type: mongoose.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  is_delete: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

const categoryModel = mongoose.model('Category', categorySchema, 'categories')

module.exports = categoryModel