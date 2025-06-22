import { S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { Readable } from 'node:stream'
import path from 'node:path'

const accessKey = process.env.AWS_ACCESS_KEY_ID!
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!
const bucket = process.env.AWS_S3_BUCKET!
const region = process.env.AWS_REGION!

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey
  }
})

async function uploadFileToS3(file: File, key: string | undefined) {
  const arrayBuffer = await file.arrayBuffer()
  const fileBuffer = Buffer.from(arrayBuffer)
  const fileName = file.name
  const extension = path.extname(fileName)

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucket,
      Key: key ? `${key}/${fileName}${extension}` : `${fileName}${extension}`,
      Body: Readable.from(fileBuffer),
      ContentType: file.type,
      ACL: 'public-read',
      CacheControl:
        'public, max-age=86400, stale-while-revalidate=86400, stale-if-error=86400'
    }
  })

  upload.on('httpUploadProgress', (progress) => {
    console.log(progress)
  })

  const response = await upload.done()
  const s3Url = response.Location

  if (!s3Url) throw Error('No S3 URL returned')

  return s3Url
}
