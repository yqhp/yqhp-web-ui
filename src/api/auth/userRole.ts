import { request } from "@/utils/service"

export function listUserRoleByUserId(userId) {
  return request({
    url: "/auth/userRole",
    method: "get",
    params: {
      userId
    }
  })
}

export function createUserRole(data) {
  return request({
    url: "/auth/userRole",
    method: "post",
    data
  })
}

export function deleteUserRole(data) {
  return request({
    url: "/auth/userRole",
    method: "delete",
    data
  })
}
