import { request } from "@/utils/service"

export function listSortedPlanDocByPlanId(planId) {
  return request({
    url: "/console/planDoc/listSortedByPlanId",
    method: "get",
    params: {
      planId
    }
  })
}

export function listPlanDocByDocId(docId) {
  return request({
    url: "/console/planDoc/listByDocId",
    method: "get",
    params: {
      docId
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

export function deletePlanDoc(data) {
  return request({
    url: "/console/planDoc",
    method: "delete",
    data
  })
}

export function movePlanDoc(data) {
  return request({
    url: "/console/planDoc/move",
    method: "put",
    data
  })
}
