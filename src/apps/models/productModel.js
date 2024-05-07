const mongoose = require('../../common/database')()

const productSchema = new mongoose.Schema(
  {
    cat_id: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: true
    },
    thumbnails: [{
      type: String,
      required: true
    }],
    price: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      default: null
    },
    status: {
      type: String,
      default: null
    },
    featured: {
      type: Boolean,
      default: false
    },
    promotion: {
      type: String,
      default: null
    },
    warranty: {
      type: String,
      default: null
    },
    accessories: {
      type: String,
      default: null
    },
    is_stock: {
      type: Boolean,
      default: true
    },
    name: {
      type: String,
      required: true,
      text: true // Use to search
    },
    slug: {
      type: String,
      required: true,
    },
    is_delete: {
      type: Boolean,
      default: false
    }
  }, { timestamps: true }
)

const productModel = mongoose.model("Product", productSchema, "products")

module.exports = productModel
