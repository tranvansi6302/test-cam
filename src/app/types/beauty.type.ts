// Body AI face
export interface SaveFaceAIRequest {
    companyId: number
    facePhotoSourceBase64: string
    ipNetwork: string
    browserNetwork: string
}

export interface FaceAIResponse {
    companyId: number
    faceCreatedDate: number
    ipNetwork: string
    browserNetwork: string
    facePhotoSource: string
    facePhotoEyebrowFinished: null | string
    customerId: null | number
    isActived: number
    id: number
    customer: {
        countryName: null
        ward: {
            localWardInfo: null
            localDistrictInfo: null
            localProvinceInfo: null
            webLocalInfo: null
        }
        partnerCatalog: {
            id: number
            isActived: boolean
            partnerCode: string
            partnerName: string
        }
        bankName: null
        typeName: null
        statusName: null
        scaleName: null
        sourceName: null
        fieldName: null
        groupName: null
        companyCode: null
        companyName: null
        companyTaxCode: null
        companyImage: null
        companyTel: null
        companyEmail: null
        companyWebsite: null
        firstName: string
        lastName: string
        gender: boolean
        telContact: string
        createdDate: number
        companyAccountNumber: string
        address: string
        wardId: number
        bankId: number
        countryId: number
        typeId: number
        scaleId: number
        sourceId: number
        fieldId: number
        groupId: number
        statusId: number
        userId: number
        isActived: number
        id: number
    }
}

// Get company face ai by current date
export interface GetCompanyFaceAIByCurrentDateRequest {
    createdDate: number
}

// Customer
export interface CustomerResponse {
    countryName: string
    ward: {
        localWardInfo: {
            wardName: string
            wardNameEN: string
            wardFullName: string
            wardFullNameEN: string
            wardLatitude: number
            wardLongitude: number
            districtId: number
            id: number
        }
        localDistrictInfo: {
            districtName: string
            districtNameEN: string
            districtFullName: string
            districtFullNameEN: string
            districtLatitude: number
            districtLongitude: number
            provinceId: number
            id: number
        }
        localProvinceInfo: {
            provinceName: string
            provinceNameEN: string
            provinceFullName: string
            provinceFullNameEN: string
            provinceLatitude: number
            provinceLongitude: number
            keyLocalization: string
            id: number
        }
        webLocalInfo: {
            localization: string
            isActived: boolean
            id: string
        }
    }
    bankName: string
    typeName: string
    statusName: string
    scaleName: string
    sourceName: string
    fieldName: string
    groupName: string
    companyCode: string
    companyName: string
    companyTaxCode: string | null
    companyImage: string | null
    companyTel: string
    companyEmail: string
    companyWebsite: string
    firstName: string
    lastName: string
    gender: boolean
    telContact: string | null
    createdDate: number
    birthday?: number
    companyAccountNumber: string
    address: string | null
    wardId: number
    bankId: number
    countryId: string
    typeId: number
    scaleId: number
    sourceId: number
    fieldId: number
    groupId: number
    statusId: number
    userId: number
    isActived: number
    id: number
    partnerId?: number
    partnerCatalog?: {
        id: number
        isActived: boolean
        partnerCode: string
        partnerName: string
    }
}

// Update face AI
export interface UpdateFaceAIRequest {
    isActived: number
    customerId: number
}

// Create face analyzer
export interface CreateFaceAnalyzerRequest {
    facePhotoEyebrowDoubleBase64: string
    facePhotoEyebrowSingleBase64: string
    facePoint: number
    faceType: string
    faceId: number
}

// Update customer
export interface UpdateCustomerRequest {
    customerId: number
    firstName: string
    lastName: string
    telContact: string | null
    address: string | null
    birthday?: number
}

// Create customer
export interface CreateCustomerRequest {
    firstName: string
    lastName: string
    telContact: string | null
    address: string | null
    gender: boolean
    birthday: number
    partnerId: number
}

// Add customer ai face
export interface AddCustomerAIFaceRequest {
    aiFaceId: number
    firstName: string
    lastName: string
    telContact: string | null
    address: string | null
    gender: boolean
    partnerId: number
}

// Face ai analazer
export interface FaceAIAnalyzerResponse {
    id: number
    facePhotoEyebrowDouble: string
    facePhotoEyebrowSingle: string
    facePoint: number
    faceType: string
    faceId: number
}

// Update facePhotoEyebrowFinished
export interface UpdateFacePhotoEyebrowFinishedRequest {
    id: number
    isActived: number
    facePhotoEyebrowFinishedBase64: string
}

// Beauty Booking Response
export interface BeautyBookingResponse {
    id: number
    customerId: number
    bookingDate: number
    bookDiscountTotal: number
    employeeIdSale: number

    isActived: boolean
    customerBooking?: CustomerResponse
    bookingDetails?: BeautyBookingDetailResponse[]
}

// Beauty Booking Detail Response
export interface BeautyBookingDetailResponse {
    id: number
    bookingId: number
    spDetailId: number
    quantity: number
    bdDiscount: number
    employeeIdWork: number | null
    beautySPDetail?: {
        id: number
        servicesId: number
        spId: number
        pricingIdTotal: number
        pricingIdDiscount: number
        serviceCatalog: {
            servIcon: string
            servCode: string
            servName: string
            servDescription: string
            servOrder: number
            servPid: number
            servParentName: string
        }
        pricingTotal: {
            id?: number
            pricCode: string
            pricIcon: string
            pricPricingUsd: number
            pricPricingVnd: number
        }
        pricingDiscount: {
            id?: number
            pricCode: string
            pricIcon: string
            pricPricingUsd: number
            pricPricingVnd: number
        }
    }
}
