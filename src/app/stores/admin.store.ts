import { create } from 'zustand'
import { getProfileAdminLocalStorage } from '../utils/storage'

export interface EmployeeSchemaType {
    empCitizenIdentity: string
    empTaxCode: string
    empCode: string
    password?: string
    empFirstName: string
    empLastName: string
    empGender: boolean
    empBirthday: number
    empImageBase64?: string
    empPlaceOfBirth: number
    empTel: string
    empEmail?: string
    empEducationLevel?: string
    empJoinedDate?: number
    degreeId: number
    traMajId: number
    empAccountNumber?: string
    bankId: number
    nationId: number
    religionId: number
    maritalId: number
    empRoleId: number
    countryId: string
    companyId: number
    empPlaceOfResidenceAddress?: string
    empPlaceOfResidenceWardId: number
    isActived: number
}

export interface EmployeeType extends EmployeeSchemaType {
    id: number
    empImage: string
    bankName: string
    countryName: string
    degreeName: string
    empPlaceOfBirthName: {
        id: number
        provinceName: string
        provinceNameEN: string
        provinceFullName: string
        provinceFullNameEN: string
        provinceLatitude: number
        provinceLongitude: number
        keyLocalization: string
    }
    empRoleName: string
    maritalStatusName: string
    nationName: string
    religionName: string
    traMajName: string
    companyName: string

    employeeCompany: {
        taxCode: string
        name: string
        email: string
        website: string
        address: string
    }
}

export interface AdminResponse {
    id: string
    fullname: string
    token: string
}

interface AdminStore {
    admin: EmployeeType | null
    setAdmin: (admin: EmployeeType) => void
}

export const useAdminStore = create<AdminStore>((set) => ({
    admin: getProfileAdminLocalStorage(),
    setAdmin: (admin: EmployeeType) => {
        set({ admin })
    }
}))
