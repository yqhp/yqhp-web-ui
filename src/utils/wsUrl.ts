export let wsBaseUrl
const httpBaseUrl = import.meta.env.VITE_BASE_API
if (httpBaseUrl.startsWith("https")) {
  wsBaseUrl = httpBaseUrl.replace("https", "wss")
} else if (httpBaseUrl.startsWith("http")) {
  wsBaseUrl = httpBaseUrl.replace("http", "ws")
} else {
  wsBaseUrl = (location.protocol.startsWith("https") ? "wss" : "ws") + `://${location.host}${httpBaseUrl}`
}

console.log("wsBaseUrl: ", wsBaseUrl)
