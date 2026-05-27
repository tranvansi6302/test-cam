/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'
import { getProfileLocalStorage } from './storage'

// Common configuration for all axios instances
const commonConfig = {
    headers: {
        'Content-Type': 'application/json'
    }
}

// Base URLs for different services
const serviceUrls = {
    // face: 'https://analyzer.365aibeauty.com/api-aibeauty/apply-adjustments',
    // face: 'https://external.365sharing.org/api-aibeauty-test/apply-adjustments',
    face: 'https://analyzer.365aibeauty.com/api-aibeauty/apply-adjustments',
    // face: import.meta.env.VITE_FACE_URL,
    erp: 'https://api.365erp.vn/v1'

    // erp: 'https://external.365sharing.org/api-erp-tkm-test'

    //     VITE_ERP_URL = https://api.365erp.online/v1
    // VITE_FACE_URL = https://analyzer.365aibeauty.com/api-aibeauty/apply-adjustments
}

// Request interceptor to handle common request logic
const requestInterceptor = (config: any) => {
    // Get token from localStorage
    const profile = getProfileLocalStorage()

    // Add authorization token if available
    if (profile && profile.token) {
        config.headers.Authorization = `Bearer ${profile.token}`
    }

    return config
}

// Error interceptor for requests
const requestErrorInterceptor = (error: any) => {
    return Promise.reject(error)
}

// Response interceptor (optional, for handling responses globally)
const responseInterceptor = (response: any) => {
    return response
}

// Error interceptor for responses
const responseErrorInterceptor = (error: any) => {
    // Handle common error cases, e.g., 401 Unauthorized
    return Promise.reject(error)
}

// Create axios instances for each service
const createAxiosInstance = (baseURL: string) => {
    const instance = axios.create({
        baseURL,
        ...commonConfig
    })

    // Attach request interceptors
    instance.interceptors.request.use(requestInterceptor, requestErrorInterceptor)

    // Attach response interceptors (optional)
    instance.interceptors.response.use(responseInterceptor, responseErrorInterceptor)

    return instance
}

// Export an object with axios instances for each service
const http = {
    face: createAxiosInstance(serviceUrls.face),
    erp: createAxiosInstance(serviceUrls.erp)
}

export default http
