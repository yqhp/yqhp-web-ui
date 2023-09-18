import { request } from "@/utils/service"

export function listPlanDeviceByPlanId(planId) {
  return request({
    url: "/console/planDevice",
    method: "get",
    params: {
      planId
    }
  })
}

export function createPlanDevice(data) {
  return request({
    url: "/console/planDevice",
    method: "post",
    data
  })
}

export function createPlanDevices(data) {
  return request({
    url: "/console/planDevice/batch",
    method: "post",
    data
  })
}

export function updatePlanDevice(id, data) {
  return request({
    url: `/console/planDevice/${id}`,
    method: "put",
    data
  })
}

export function deletePlanDeviceById(id) {
  return request({
    url: `/console/planDevice/${id}`,
    method: "delete"
  })
}

export function movePlanDevice(data) {
  return request({
    url: "/console/planDevice/move",
    method: "put",
    data
  })
}
