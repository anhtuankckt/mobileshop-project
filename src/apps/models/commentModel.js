const mongoose = require('../../common/database')()

const commentSchema = new mongoose.Schema(
  {
    prd_id: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: true
    },
    full_name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    parrent_comment_id: {
      type: mongoose.Types.ObjectId,
      ref: 'Comment',
      default: null
    },
    left: {
      type: Number,
      default: 0
    },
    right: {
      type: Number,
      default: 0
    },
    allow: {
      type: Boolean,
      default: false
    }
  }, { timestamps: true }
);

const commentModel = mongoose.model("Comment", commentSchema, "comments")

module.exports = commentModel
