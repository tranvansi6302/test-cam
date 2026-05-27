import { create } from 'zustand'
import { CompanyResponse } from '../types/company.type'

interface AuthCompanyStore {
    authCompany: CompanyResponse | null
    setAuthCompany: (company: CompanyResponse) => void
}

export const useAuthCompnanyStore = create<AuthCompanyStore>((set) => ({
    authCompany: null,
    setAuthCompany: (company: CompanyResponse) => set({ authCompany: company })
}))
