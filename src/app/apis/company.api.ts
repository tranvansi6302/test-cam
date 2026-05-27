import { LoginForm, LoginFormCheck } from '../schemas/login.schema'
import { ApiResponse } from '../types/api.type'
import { CheckCompanyResponse, CompanyResponse, LoginResponse } from '../types/company.type'
import http from '../utils/http'


export const companyApi = {

      loginCheck: async (body: LoginFormCheck) => {
        return await http.erp.post<LoginResponse>('/sys/Account', body)
    },
    login: async (body: LoginForm) => {
        return await http.erp.post<LoginResponse>('/define/Company/login', body)
    },

    //  /v1/sys/CheckCompany/company/{companyId}
    getCheckCompanyById: async (id: string) => {
        return await http.erp.get<ApiResponse<CheckCompanyResponse>>(`/sys/CheckCompany/company/${id}`)
    },
    getComanyById: async ({ companyId, token }: { companyId: number; token: string }) => {
        return await http.erp.get<ApiResponse<CompanyResponse>>(`/define/Company/${companyId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
    },
    getCheckCompany: async (token: string) => {
        return await http.erp.get<ApiResponse<CheckCompanyResponse[]>>('/sys/CheckCompany', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
    }
}
