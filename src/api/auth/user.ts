import { request } from "@/utils/service"

export function getUserInfo() {
  return request({
    url: "/auth/user/info",
    method: "get"
  })
}

export function getPagingUsers(params) {
  return request({
    url: "/auth/user/page",
    method: "get",
    params
  })
}

export function createUser(data) {
  return request({
    url: "/auth/user",
    method: "post",
    data
  })
}

export function updateUser(userId, data) {
  return request({
    url: `/auth/user/${userId}`,
    method: "put",
    data
  })
}

export function deleteUser(userId) {
  return request({
    url: `/auth/user/${userId}`,
    method: "delete"
  })
}

export function resetPassword(userId, password) {
  const formData = new FormData()
  formData.append("password", password)

  return request({
    url: `/auth/user/${userId}/resetPassword`,
    method: "put",
    data: formData
  })
}

export function changeUserStatus(userId, status) {
  return request({
    url: `/auth/user/${userId}/status/${status}`,
    method: "put"
  })
}
