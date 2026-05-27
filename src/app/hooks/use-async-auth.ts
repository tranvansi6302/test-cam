import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { companyApi } from '../apis/company.api'
import { useAuthCompnanyStore } from '../stores/auth-company.store'
import { CompanyResponse } from '../types/company.type'
import { getProfileLocalStorage } from '../utils/storage'
import { useAdminStore } from '../stores/admin.store'

export const useAsyncAuth = () => {
    const { setAuthCompany } = useAuthCompnanyStore()
    const profile = getProfileLocalStorage()
    const { admin } = useAdminStore()

    const { data } = useQuery({
        queryKey: ['companyData'],
        queryFn: async () => {
            if (!profile || !profile.token || !profile.id) {
                return null
            }

            const response = await companyApi.getComanyById({
                companyId: admin ? admin.companyId : profile.id,
                token: profile.token
            })

            return response.data?.data || null
        },
        enabled: !!profile?.token && !!profile?.id,
        staleTime: Infinity,
        gcTime: Infinity,
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false
    })

    // Trường hợp nếu có admin

    useEffect(() => {
        if (data) {
            setAuthCompany(data as CompanyResponse)
        }
    }, [data, setAuthCompany])
}
