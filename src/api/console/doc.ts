import { request } from "@/utils/service"

export function getDocById(id) {
  return request({
    url: `/console/doc/${id}`,
    method: "get"
  })
}

export function listInitDocByProjectId(projectId) {
  return request({
    url: "/console/doc/init",
    method: "get",
    params: {
      projectId
    }
  })
}

export function createDoc(data) {
  return request({
    url: "/console/doc",
    method: "post",
    data
  })
}

export function copyDoc(id) {
  return request({
    url: `/console/doc/${id}/copy`,
    method: "get"
  })
}

export function updateDoc(id, data) {
  return request({
    url: `/console/doc/${id}`,
    method: "put",
    data
  })
}

export function updateDocContent(id, content) {
  const data = new FormData()
  data.append("content", content)
  return request({
    url: `/console/doc/${id}/content`,
    method: "put",
    data
  })
}

export function deleteDocById(id) {
  return request({
    url: `/console/doc/${id}`,
    method: "delete"
  })
}

export function moveDoc(data) {
  return request({
    url: "/console/doc/move",
    method: "put",
    data
  })
}
