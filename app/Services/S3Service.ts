import AWS from 'aws-sdk'
import Env from '@ioc:Adonis/Core/Env'

AWS.config.update({
  accessKeyId: Env.get('S3_KEY'),
  secretAccessKey: Env.get('S3_SECRET'),
  region: Env.get('S3_REGION'),
})

const s3 = new AWS.S3({ signatureVersion: 'v4' })

class S3Service {
  static async getPresignedUrl(fileKey: string, expirationTime = 3600) {
    const params = {
      Bucket: 'fitsterwebsite',
      Key: fileKey,
      Expires: expirationTime,
    }

    const presignedUrl = await s3.getSignedUrl('getObject', params)

    return presignedUrl
  }
}

export default S3Service
