import { EmployeeType } from '../stores/admin.store'
import { LoginResponse } from '../types/company.type'

// Save profile local storage
export const saveProfileLocalStorage = (profile: LoginResponse) => {
    localStorage.setItem('profile', JSON.stringify(profile))
}

// Get profile local storage
export const getProfileLocalStorage = () => {
    const profile = localStorage.getItem('profile')
    return profile ? (JSON.parse(profile) as LoginResponse) : null
}

// Remove profile local storage
export const removeProfileLocalStorage = () => {
    localStorage.removeItem('profile')
}

// Save ip public
export const saveIpPublicLocalStorage = (ip: string) => {
    localStorage.setItem('ipPublic', ip)
}

// Get ip public
export const getIpPublicLocalStorage = () => {
    const ipPublic = localStorage.getItem('ipPublic')
    return ipPublic || null
}

// saveProfileAdminLocalStorage
export const saveProfileAdminLocalStorage = (admin: EmployeeType) => {
    localStorage.setItem('admin', JSON.stringify(admin))
}

// getProfileAdminLocalStorage
export const getProfileAdminLocalStorage = () => {
    const admin = localStorage.getItem('admin')
    return admin ? (JSON.parse(admin) as EmployeeType) : null
}
