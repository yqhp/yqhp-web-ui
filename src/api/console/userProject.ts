import { request } from "@/utils/service"

export function listUserProjectByUserId(userId) {
  return request({
    url: "/console/userProject",
    method: "get",
    params: {
      userId
    }
  })
}

export function createUserProject(data) {
  return request({
    url: "/console/userProject",
    method: "post",
    data
  })
}

export function deleteUserProject(data) {
  return request({
    url: "/console/userProject",
    method: "delete",
    data
  })
}
