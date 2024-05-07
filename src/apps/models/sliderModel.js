const mongoose = require('../../common/database')()

const sliderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  thumbnails: [{
    type: String,
    required: true
  }],
  allow: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

const sliderModel = mongoose.model('Slider', sliderSchema, 'sliders')

module.exports = sliderModel