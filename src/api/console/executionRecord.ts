import { request } from "@/utils/service"

export function getPagingExecutionRecord(data) {
  return request({
    url: "/console/executionRecord/page",
    method: "post",
    data
  })
}

export function getReportById(id) {
  return request({
    url: `/console/executionRecord/${id}/report`,
    method: "get"
  })
}

export function deleteDeviceExecutionRecord(id, deviceId) {
  return request({
    url: `/console/executionRecord/${id}/device/${deviceId}`,
    method: "delete"
  })
}

export function deleteExecutionRecord(id) {
  return request({
    url: `/console/executionRecord/${id}`,
    method: "delete"
  })
}
