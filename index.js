const AWS = require('aws-sdk')
const sharp = require('sharp')
require('dotenv').config()

const s3 = new AWS.S3({ apiVersion: '2006-03-01' })

exports.handler = async (event) => {
  const Bucket = event.Records[0].s3.bucket.name
  const Key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '))

  try {
    const { Body } = await s3.getObject({ Bucket, Key }).promise()

    let { width } = await sharp(Body).metadata()
    width = width < process.env.DEFEAULT_WIDHT ? width : process.env.DEFEAULT_WIDHT

    const newBody = sharp(Body).resize(width).toBuffer()
    const newKey = process.env.OUTPUT_DIRECTORY_S3 + Key.slice(9, Key.length)

    await s3.upload({ Bucket, Body: newBody, Key: newKey }).promise()
  } catch (err) {
    console.log('Error: ' + err)
    throw err
  }
}
