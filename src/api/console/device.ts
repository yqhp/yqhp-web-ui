import { request } from "@/utils/service"

export function getAllDevices() {
  return request({
    url: "/console/device/all",
    method: "get"
  })
}

export function getPagingDevices(params) {
  return request({
    url: "/console/device/page",
    method: "get",
    params
  })
}

export function updateDevice(id, data) {
  return request({
    url: `/console/device/${id}`,
    method: "put",
    data
  })
}

export function deleteDeviceById(id) {
  return request({
    url: `/console/device/${id}`,
    method: "delete"
  })
}
