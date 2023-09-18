import { request } from "@/utils/service"

export function getPagingPlans(params) {
  return request({
    url: "/console/plan/page",
    method: "get",
    params
  })
}

export function listPlanByProjectId(projectId) {
  return request({
    url: "/console/plan",
    method: "get",
    params: {
      projectId
    }
  })
}

export function createPlan(data) {
  return request({
    url: "/console/plan",
    method: "post",
    data
  })
}

export function updatePlan(id, data) {
  return request({
    url: `/console/plan/${id}`,
    method: "put",
    data
  })
}

export function deletePlanById(id) {
  return request({
    url: `/console/plan/${id}`,
    method: "delete"
  })
}

export function execPlanById(id) {
  return request({
    url: `/console/plan/${id}/exec`,
    method: "get"
  })
}
