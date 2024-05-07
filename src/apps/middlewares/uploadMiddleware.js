const multer = require('multer')
const config = require('config')

const tmp = config.get('app.tmp')

const upload = multer({ dest: tmp })

module.exports = upload
