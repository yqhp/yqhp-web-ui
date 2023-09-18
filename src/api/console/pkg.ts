import { request } from "@/utils/service"

export function getPkgTree(params) {
  return request({
    url: "/console/pkg/tree",
    method: "get",
    params
  })
}

export function createPkg(data) {
  return request({
    url: "/console/pkg",
    method: "post",
    data
  })
}

export function updatePkg(id, data) {
  return request({
    url: `/console/pkg/${id}`,
    method: "put",
    data
  })
}

export function deletePkgById(id) {
  return request({
    url: `/console/pkg/${id}`,
    method: "delete"
  })
}

export function movePkg(data) {
  return request({
    url: "/console/pkg/move",
    method: "put",
    data
  })
}
