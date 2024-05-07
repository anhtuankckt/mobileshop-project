const mongoose = require('mongoose')
const config = require('config')
const mongodbUri = config.get('db.mongodb')

module.exports = () => {
  mongoose
    .connect(mongodbUri)
    .then(() => {
      console.log("Mongodb connected")
    })
    .catch((err) => {
      console.log(err)
    })

  return mongoose
}
