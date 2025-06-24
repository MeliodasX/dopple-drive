export const formatGoogleDriveFileSize = (bytes?: number) => {
  if (!bytes || typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) {
    return ''
  }

  if (bytes === 0) {
    return '0 Bytes'
  }

  const k = 1024
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(1))

  return `${value} ${units[i]}`
}
