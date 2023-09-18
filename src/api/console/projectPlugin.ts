import { request } from "@/utils/service"

export function listProjectPluginByProjectId(projectId) {
  return request({
    url: "/console/projectPlugin",
    method: "get",
    params: {
      projectId
    }
  })
}

export function createProjectPlugin(data) {
  return request({
    url: "/console/projectPlugin",
    method: "post",
    data
  })
}

export function deleteProjectPlugin(data) {
  return request({
    url: "/console/projectPlugin",
    method: "delete",
    data
  })
}
