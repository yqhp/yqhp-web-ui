import { request } from "@/utils/service"

export function queryToken(form) {
  const formData = new FormData()
  formData.append("username", form.username)
  formData.append("password", form.password)
  return request({
    url: "/auth/token",
    method: "post",
    data: formData
  })
}

export function logout() {
  return request({
    url: "/auth/token/remove",
    method: "delete"
  })
}
