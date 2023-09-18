import { request } from "@/utils/service"

export function listJoinedProjects() {
  return request({
    url: "/console/project/joined",
    method: "get"
  })
}

export function getAllProjects() {
  return request({
    url: "/console/project/all",
    method: "get"
  })
}

export function getPagingProjects(params) {
  return request({
    url: "/console/project/page",
    method: "get",
    params
  })
}

export function getProjectById(id) {
  return request({
    url: `/console/project/${id}`,
    method: "get"
  })
}

export function createProject(data) {
  return request({
    url: "/console/project",
    method: "post",
    data
  })
}

export function updateProject(id, data) {
  return request({
    url: `/console/project/${id}`,
    method: "put",
    data
  })
}

export function deleteProject(id) {
  return request({
    url: `/console/project/${id}`,
    method: "delete"
  })
}
