import { ApiResponse, LoginEmployeeRequestType, LoginResponseType } from '../types/api.type'
import http from '../utils/http'

export const emAccessCommandApi = {
    loginEmployee: async (body: LoginEmployeeRequestType) => {
        const url = '/beauty/EmployeeAccess/Login'
        const response = (await http.erp.post(url, body)) as ApiResponse<LoginResponseType>
        return response
    }
}
