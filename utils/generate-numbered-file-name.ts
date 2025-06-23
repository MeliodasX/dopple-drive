export const generateNumberedFileName = (
  originalName: string,
  copyNumber: number
): string => {
  if (copyNumber === 0) {
    return originalName
  }
  const nameParts =
    originalName.lastIndexOf('.') > -1
      ? originalName.split('.')
      : [originalName, '']
  const extension = nameParts.pop() || ''
  const baseName = nameParts.join('.')
  return `${baseName} (${copyNumber})${extension ? '.' + extension : ''}`
}
