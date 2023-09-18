import { request } from "@/utils/service"

export function getAllRoles() {
  return request({
    url: "/auth/role/all",
    method: "get"
  })
}
