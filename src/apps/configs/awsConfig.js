const AWS = require('aws-sdk')
const config = require('config')

AWS.config.update({
  accessKeyId: config.get('aws.accessKeyId'),
  secretAccessKey: config.get('aws.secretAccessKey'),
  region: config.get('aws.region'),
})

const s3 = new AWS.S3()
const bucketName = config.get('aws.bucketName')

module.exports = { s3, bucketName }