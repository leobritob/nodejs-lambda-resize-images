const AWS = require('aws-sdk')
const sharp = require('sharp')
if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
}

const s3 = new AWS.S3({ apiVersion: '2006-03-01' })

exports.handler = async (event) => {
  const Bucket = event.Records[0].s3.bucket.name
  const Key = event.Records[0].s3.object.key

  try {
    const { Body } = await s3.getObject({ Bucket, Key }).promise()

    const newBody = await sharp(Body).resize(process.env.DEFEAULT_WIDHT).toBuffer()
    const newKey = process.env.OUTPUT_DIRECTORY_S3 + Key.slice(9, Key.length)

    await s3.upload({ Bucket, Body: newBody, Key: newKey }).promise()

    await s3.deleteObject({ Bucket, Key }).promise()
  } catch (err) {
    console.log('Error: ' + err)
    throw err
  }
}
