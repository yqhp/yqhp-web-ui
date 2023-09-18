import { request } from "@/utils/service"

export function listAgentInstance() {
  return request({
    url: "/console/agent/instance",
    method: "get"
  })
}

export function listAgentInfo() {
  return request({
    url: "/console/agent/info",
    method: "get"
  })
}
