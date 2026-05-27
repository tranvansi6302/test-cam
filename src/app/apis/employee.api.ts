import { EmployeeType } from '../stores/admin.store'
import { ApiResponse } from '../types/api.type'
import http from '../utils/http'

export const employeeQueryApi = {
    getAllEmployee: async (params?: Record<string, unknown>) => {
        const url = '/hrm/Employee'
        const response = await http.erp.get(url, { params })
        return response.data as EmployeeType[]
    },
    getEmployeeById: async (id: number, token: string) => {
        const url = `/hrm/Employee/${id}`
        const response = (await http.erp.get(url, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })) as ApiResponse<{
            data: EmployeeType
        }>
        return response.data
    }
}
