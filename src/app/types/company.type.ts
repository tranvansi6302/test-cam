// Login response type
export type LoginResponse = {
    id: number
    fullName: string
    token: string
}

// Company response type
// Interface for WebLocalInfo
interface WebLocalInfo {
    localization: string
    isActived: boolean
    id: string
}

// Interface for LocalProvinceInfo
interface LocalProvinceInfo {
    provinceName: string
    provinceNameEN: string
    provinceFullName: string
    provinceFullNameEN: string
    provinceLatitude: number
    provinceLongitude: number
    keyLocalization: string
    id: number
}

// Interface for LocalDistrictInfo
interface LocalDistrictInfo {
    districtName: string
    districtNameEN: string
    districtFullName: string
    districtFullNameEN: string
    districtLatitude: number
    districtLongitude: number
    provinceId: number
    id: number
}

// Interface for LocalWardInfo
interface LocalWardInfo {
    wardName: string
    wardNameEN: string
    wardFullName: string
    wardFullNameEN: string
    wardLatitude: number
    wardLongitude: number
    districtId: number
    id: number
}

// Interface for Ward
interface Ward {
    localWardInfo: LocalWardInfo
    localDistrictInfo: LocalDistrictInfo
    localProvinceInfo: LocalProvinceInfo
    webLocalInfo: WebLocalInfo
}

// Interface for Department
interface Department {
    departmentCode: string
    departmentName: string
    isActived: boolean
    id: number
}

// Interface for Position
interface Position {
    positionCode: string
    positionName: string
    id: number
}

// Interface for Company
export interface CompanyResponse {
    countryName: string
    ward: Ward
    departments: Department[]
    positions: Position[]
    companyPid: number
    taxCode: string
    name: string
    image: string
    tel: string
    email: string
    website: string
    founder: string
    ceo: string
    ceoImage: string | null
    ceoEmail: string
    ceoTel: string
    license: string
    countryId: string
    wardId: number
    address: string
    isActived: boolean
    id: number
}

// Interface for Data item
export interface CheckCompanyResponse {
    company: CompanyResponse
    ipNetworkDeclare: string
    companyId: number
    multiLogin: number
    id: number
}
