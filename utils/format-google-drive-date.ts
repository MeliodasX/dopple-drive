export const formatGoogleDriveDate = (dateInput: string) => {
  const date = new Date(dateInput)
  const now = new Date()

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  )
  const startOfYesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1
  )
  const startOfLastWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 6
  )

  if (date >= startOfToday) {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date)
  }

  if (date >= startOfYesterday) {
    return 'Yesterday'
  }

  if (date >= startOfLastWeek) {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long'
    }).format(date)
  }

  if (date.getFullYear() === now.getFullYear()) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}
