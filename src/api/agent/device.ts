import { request } from "@/utils/service"
import { wsBaseUrl } from "@/utils/wsUrl"

export function lockDevice(deviceId, location) {
  return request({
    url: `/agent/device/${deviceId}/lock`,
    method: "get",
    headers: {
      "agent-location": location
    }
  })
}

export function unlockDevice(deviceToken, location) {
  return request({
    url: "/agent/device/unlock",
    method: "get",
    headers: {
      "agent-location": location,
      deviceToken
    }
  })
}

export function installApp(app, deviceToken, location) {
  const formData = new FormData()
  formData.append("app", app)

  return request({
    url: "/agent/device/installApp",
    method: "post",
    timeout: 300_000,
    headers: {
      "agent-location": location,
      deviceToken
    },
    data: formData
  })
}

export function dumpHierarchy(deviceToken, location) {
  return request({
    url: "/agent/device/dumpHierarchy",
    method: "get",
    timeout: 300_000,
    headers: {
      "agent-location": location,
      deviceToken
    }
  })
}

/**
 * 非admin可以用
 */
export function screenshotByToken(deviceToken, location) {
  return request({
    url: "/agent/device/screenshot",
    method: "get",
    timeout: 30_000,
    headers: {
      "agent-location": location,
      deviceToken
    }
  })
}

/**
 * admin使用
 */
export function screenshotById(deviceId, location) {
  return request({
    url: `/agent/device/${deviceId}/screenshot`,
    method: "get",
    timeout: 30_000,
    headers: {
      "agent-location": location
    }
  })
}

export function getDeviceInfo(deviceId, location) {
  return request({
    url: `/agent/device/${deviceId}/info`,
    method: "get",
    headers: {
      "agent-location": location
    }
  })
}

export function listBrowser(deviceToken, location) {
  return request({
    url: "/agent/device/browser",
    method: "get",
    headers: {
      "agent-location": location,
      deviceToken
    }
  })
}

export function getDevtoolsWsUrl(deviceToken, deviceLocation, socketName, page) {
  return `${wsBaseUrl}/agent/device/devtools/token/${deviceToken}/socket/${socketName}/page/${page}?agent-location=${deviceLocation}`
}

export function getScrcpyWsUrl(deviceToken, deviceLocation) {
  return `${wsBaseUrl}/agent/device/scrcpy/token/${deviceToken}?agent-location=${deviceLocation}`
}

export function getWdaWsUrl(deviceToken, deviceLocation) {
  return `${wsBaseUrl}/agent/device/wda/token/${deviceToken}?agent-location=${deviceLocation}`
}

export function getDeviceJShellExecutionWsUrl(deviceToken, deviceLocation) {
  return `${wsBaseUrl}/agent/device/jshellExecution/token/${deviceToken}?agent-location=${deviceLocation}`
}

export function getDeviceJShellSuggestionsWsUrl(deviceToken, deviceLocation) {
  return `${wsBaseUrl}/agent/device/jshellSuggestions/token/${deviceToken}?agent-location=${deviceLocation}`
}

export function getAppiumLogWsUrl(deviceToken, deviceLocation) {
  return `${wsBaseUrl}/agent/device/appiumLog/token/${deviceToken}?agent-location=${deviceLocation}`
}
