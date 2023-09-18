import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios"
import { useUserStoreHook } from "@/store/modules/user"
import { ElMessage } from "element-plus"
import { get } from "lodash-es"
import { getToken } from "./cache/cookies"

/** 退出登录并强制刷新页面（会重定向到登录页） */
function logout() {
  useUserStoreHook().logout()
  location.reload()
}

/** 创建请求实例 */
function createService() {
  // 创建一个 axios 实例命名为 service
  const service = axios.create()
  // 请求拦截
  service.interceptors.request.use(
    (config) => config,
    // 发送失败
    (error) => Promise.reject(error)
  )
  // 响应拦截（可根据具体业务作出相应的调整）
  service.interceptors.response.use(
    (response) => {
      return response.data
    },
    (error) => {
      // HTTP 状态码
      const httpStatus = get(error, "response.status")
      if (httpStatus === 401) {
        logout()
      }

      const response = error.response?.data
      if (response) {
        if (response.code === 444) {
          // 请求参数校验不通过，服务端返回data是一个不为空的数组
          response.data.forEach((fieldError) => {
            ElMessage.error(fieldError.defaultMessage)
          })
        } else {
          ElMessage.error(response.msg || response.error_description || response.error || error.message)
        }
      } else {
        ElMessage.error(error.message)
      }
      return Promise.reject(error)
    }
  )
  return service
}

/** 创建请求方法 */
function createRequest(service: AxiosInstance) {
  return function <T>(config: AxiosRequestConfig): Promise<T> {
    const conf = {
      headers: {},
      timeout: 10_000,
      baseURL: import.meta.env.VITE_BASE_API,
      ...config
    }
    const token = getToken()
    if (token) {
      conf.headers.Authorization = `Bearer ${token}`
    }
    return service(conf)
  }
}

/** 用于网络请求的实例 */
const service = createService()
/** 用于网络请求的方法 */
export const request = createRequest(service)
