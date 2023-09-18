import { request } from "@/utils/service"

export function createPluginFile(data) {
  return request({
    url: "/console/pluginFile",
    method: "post",
    data
  })
}

export function listPluginFileByPluginId(pluginId) {
  return request({
    url: "/console/pluginFile",
    method: "get",
    params: {
      pluginId
    }
  })
}

export function deletePluginFileById(id) {
  return request({
    url: `/console/pluginFile/${id}`,
    method: "delete"
  })
}
