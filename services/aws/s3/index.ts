import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { Readable } from 'node:stream'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const accessKey = process.env.AWS_ACCESS_KEY_ID!
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!
const bucket = process.env.AWS_S3_BUCKET!
const region = process.env.AWS_REGION!
const endpoint = process.env.MINIO_ENDPOINT!

const baseParams = {
  region,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey
  }
}

const devParams = {
  ...baseParams
}

let s3Client: S3Client

// Using Minio for local development
if (process.env.NODE_ENV === 'development') {
  s3Client = new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretAccessKey
    },
    forcePathStyle: true
  })
} else {
  s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretAccessKey
    }
  })
}

export const uploadFileToS3 = async (file: File, key: string) => {
  const arrayBuffer = await file.arrayBuffer()
  const fileBuffer = Buffer.from(arrayBuffer)
  const size = fileBuffer.byteLength
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucket,
      Key: key,
      Body: Readable.from(fileBuffer),
      ContentType: file.type,
      ACL: 'private',
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

  return {
    url: s3Url,
    size
  }
}

export const deleteFileFromS3 = async (key: string) => {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key
      })
    )
  } catch (error) {
    console.error('Error deleting from S3:', error)
    throw new Error('Failed deleting from S3')
  }
}

export const getPreSignedURL = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key
  })

  return await getSignedUrl(s3Client, command, {
    expiresIn: 3600
  })
}

export const putPreSignedURL = async (key: string, fileType: string) => {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: fileType
  })

  return await getSignedUrl(s3Client, command, {
    expiresIn: 3600
  })
}
