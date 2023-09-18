import { request } from "@/utils/service"

export function listPluginByProjectId(projectId) {
  return request({
    url: "/console/plugin",
    method: "get",
    params: {
      projectId
    }
  })
}

export function listPluginDTOByProjectId(projectId) {
  return request({
    url: "/console/plugin/details",
    method: "get",
    params: {
      projectId
    }
  })
}

export function getAllPlugins() {
  return request({
    url: "/console/plugin/all",
    method: "get"
  })
}

export function getPagingPlugins(params) {
  return request({
    url: "/console/plugin/page",
    method: "get",
    params
  })
}

export function createPlugin(data) {
  return request({
    url: "/console/plugin",
    method: "post",
    data
  })
}

export function updatePlugin(id, data) {
  return request({
    url: `/console/plugin/${id}`,
    method: "put",
    data
  })
}

export function deletePlugin(id) {
  return request({
    url: `/console/plugin/${id}`,
    method: "delete"
  })
}
