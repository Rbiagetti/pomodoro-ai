import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

let retryCallback = null
export const setRetryCallback = (fn) => { retryCallback = fn }

API.interceptors.response.use(null, async (error) => {
  const config = error.config
  if (error.response?.status === 429 && (config._retryCount || 0) < 2) {
    config._retryCount = (config._retryCount || 0) + 1
    retryCallback?.(`AI occupata, riprovo... (${config._retryCount}/2)`)
    await sleep(10000)
    return API(config)
  }
  retryCallback?.(null)
  return Promise.reject(error)
})

export default API
