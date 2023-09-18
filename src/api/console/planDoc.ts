import { request } from "@/utils/service"

export function listPlanDocByPlanId(planId) {
  return request({
    url: "/console/planDoc",
    method: "get",
    params: {
      planId
    }
  })
}

export function createPlanDoc(data) {
  return request({
    url: "/console/planDoc",
    method: "post",
    data
  })
}

export function createPlanDocs(data) {
  return request({
    url: "/console/planDoc/batch",
    method: "post",
    data
  })
}

export function updatePlanDoc(id, data) {
  return request({
    url: `/console/planDoc/${id}`,
    method: "put",
    data
  })
}

export function deletePlanDocById(id) {
  return request({
    url: `/console/planDoc/${id}`,
    method: "delete"
  })
}

export function movePlanDoc(data) {
  return request({
    url: "/console/planDoc/move",
    method: "put",
    data
  })
}
