import dayjs from "dayjs"

export const formatDate = (time: string | number | Date) => {
  return format(time, "YYYY-MM-DD")
}

export const formatDateTime = (time: string | number | Date) => {
  return format(time, "YYYY-MM-DD HH:mm:ss")
}

export const formatMMDDHHmmss = (time: string | number | Date) => {
  return format(time, "MM-DD HH:mm:ss")
}

export const formatTime = (time: string | number | Date) => {
  return format(time, "HH:mm:ss")
}

export const format = (time: string | number | Date, template?: string) => {
  if (!time) {
    return "N/A"
  }
  const date = new Date(time)
  return dayjs(date).format(template)
}

export const formatMillis = (ms: number): string => {
  if (ms < 0) {
    return "N/A"
  }
  if (ms < 1000) {
    return `${ms}ms`
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`
  } else if (ms < 3600000) {
    return `${(ms / 60000).toFixed(2)}min`
  } else if (ms < 86400000) {
    return `${(ms / 3600000).toFixed(2)}h`
  } else {
    return `${(ms / 86400000).toFixed(2)}d`
  }
}
