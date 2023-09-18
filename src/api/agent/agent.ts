import { request } from "@/utils/service"
import { wsBaseUrl } from "@/utils/wsUrl"

export function register(location, runMode) {
  return request({
    url: "/agent/register",
    method: "get",
    headers: {
      "agent-location": location
    },
    params: {
      runMode
    }
  })
}

export function getJShellExecutionWsUrl(token, location) {
  return `${wsBaseUrl}/agent/jshellExecution/token/${token}?agent-location=${location}`
}

export function getJShellSuggestionsWsUrl(token, location) {
  return `${wsBaseUrl}/agent/jshellSuggestions/token/${token}?agent-location=${location}`
}
