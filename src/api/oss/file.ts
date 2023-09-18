import { request } from "@/utils/service"
import { getToken } from "@/utils/cache/cookies"

export const uploadUrl = import.meta.env.VITE_BASE_API + "/oss/file"
export const authHeader = {
  Authorization: "Bearer " + getToken()
}

export function uploadFile(file, isTmpFile = false) {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("isTmpFile", isTmpFile + "")

  return request({
    url: "/oss/file",
    method: "post",
    timeout: 300_000,
    data: formData
  })
}

export function deleteFile(key: string) {
  return request({
    url: "/oss/file",
    method: "delete",
    params: {
      key
    }
  })
}
