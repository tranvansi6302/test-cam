import { ApiResponse } from '../types/api.type'
import {
    GetCompanyFaceAIByCurrentDateRequest,
    SaveFaceAIRequest,
    FaceAIResponse,
    CustomerResponse,
    UpdateFaceAIRequest,
    CreateFaceAnalyzerRequest,
    UpdateCustomerRequest,
    AddCustomerAIFaceRequest,
    FaceAIAnalyzerResponse,
    UpdateFacePhotoEyebrowFinishedRequest,
    BeautyBookingResponse,
    BeautyBookingDetailResponse,
    CreateCustomerRequest
} from '../types/beauty.type'
import http from '../utils/http'

export interface Employee {
    id: number
    empCode: string
    empFullName: string
    empAvatar?: string
    empPhone?: string
    empEmail?: string
    empAddress?: string
    empNote?: string
    isActived?: number
    empGender?: boolean
    empFirstName?: string
    empLastName?: string
}

export interface UpdatePhotoSourceRequest {
    facePhotoSourceBase64: string
}

// Service pricing types
export interface BeautyServicePricingDetailType {
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
    spName?: string
    spCreatedDate?: number
    spPricingApplyDate?: number
}

export interface BeautyServicePricingType {
    id: number
    companyId: number
    spPricingApplyDate: number
    spName: string
    spDescription: string
    createdDate: number
    isActived: number
    beautySPDetails: BeautyServicePricingDetailType[]
}

export const beautyApi = {
    saveFaceAI: async (body: SaveFaceAIRequest) => {
        return await http.erp.post('/beauty/AIFace', body)
    },

    getFaceAIById: async (id: string) => {
        return await http.erp.get<ApiResponse<FaceAIResponse>>(`/beauty/AIFace/${id}`)
    },

    updateFaceAI: async (id: string, body: UpdateFaceAIRequest) => {
        return await http.erp.put(`/beauty/AIFace/${id}`, body)
    },

    updatePhotoSource: async (id: string, body: UpdatePhotoSourceRequest) => {
        return await http.erp.put(`/beauty/AIFace/${id}`, body)
    },

    // Update facePhotoEyebrowFinished
    updateFacePhotoEyebrowFinished: async (body: UpdateFacePhotoEyebrowFinishedRequest) => {
        return await http.erp.put(`/beauty/AIFace/${body.id}`, body)
    },

    addCustomerAIFace: async (body: AddCustomerAIFaceRequest) => {
        return await http.erp.post('/beauty/AIFace/AddCustomer', body)
    },

    getCompanyFaceAIByCurrentDate: async (body: GetCompanyFaceAIByCurrentDateRequest) => {
        return await http.erp.get<ApiResponse<FaceAIResponse[]>>('/beauty/AIFace', { params: body })
    },

    createFaceAnalyzer: async (body: CreateFaceAnalyzerRequest) => {
        return await http.erp.post('/beauty/AIAnalyzer', body)
    },

    // Customer
    getAllCustomer: async () => {
        return await http.erp.get<ApiResponse<CustomerResponse[]>>('/crm/CustomerCatalog')
    },
    getAllPartner: async () => {
        return await http.erp.get<
            ApiResponse<
                {
                    partnerCode: string
                    partnerName: string
                    isActived: boolean
                    id: number
                }[]
            >
        >('/crm/PartnerCatalog')
    },
    getCustomerById: async (id: number) => {
        return await http.erp.get<ApiResponse<CustomerResponse>>(`/crm/CustomerCatalog/${id}`)
    },

    createCustomer: async (body: CreateCustomerRequest) => {
        return await http.erp.post<ApiResponse<CustomerResponse>>('/crm/CustomerCatalog', body)
    },

    updateCustomer: async (body: UpdateCustomerRequest) => {
        return await http.erp.put(`/crm/CustomerCatalog/${body.customerId}`, body)
    },

    // Get all face ai analyzer
    getAllFaceAIAnalyzer: async () => {
        return await http.erp.get<ApiResponse<FaceAIAnalyzerResponse[]>>('/beauty/AIAnalyzer')
    },

    // Face ai analyzer
    getFaceAIAnalyzer: async (id: number) => {
        return await http.erp.get<ApiResponse<FaceAIAnalyzerResponse>>(`/beauty/AIAnalyzer/${id}`)
    },

    // Beauty service pricing
    getBeautyServicePricing: async (companyId: number) => {
        // Match the endpoint in erp-beauty project
        return await http.erp.get<ApiResponse<BeautyServicePricingType>>(
            `/beauty/ServicePricing/ApplyDate?companyId=${companyId}`
        )
    },

    // Get employees
    getEmployees: async (companyId: number) => {
        return await http.erp.get<ApiResponse<Employee[]>>('/hrm/Employee', { params: { companyId } })
    },

    // Create beauty booking
    createBeautyBooking: async (body: {
        customerId: number
        bookDiscountTotal: number
        bookingDate: number
        employeeIdSale: number
        isActived: boolean
    }) => {
        return await http.erp.post('/beauty/Booking', body)
    },

    // Create beauty booking detail
    createBeautyBookingDetail: async (body: {
        bdDiscount: number
        bookingId: number
        employeeIdWork: number | null
        quantity: number
        spDetailId: number
    }) => {
        return await http.erp.post('/beauty/BookingDetail', body)
    },

    // Get beauty bookings by customer ID
    getBeautyBookingsByCustomerId: async (customerId: number) => {
        return await http.erp.get<ApiResponse<BeautyBookingResponse[]>>(`/beauty/Booking?customerId=${customerId}`)
    },

    // Get beauty booking by ID
    getBeautyBookingById: async (id: number) => {
        return await http.erp.get<ApiResponse<BeautyBookingResponse>>(`/beauty/Booking/${id}`)
    },

    // Get beauty booking details by booking ID
    getBeautyBookingDetailsByBookingId: async (bookingId: number) => {
        return await http.erp.get<ApiResponse<BeautyBookingDetailResponse[]>>(`/beauty/BookingDetail?bookingId=${bookingId}`)
    }
}
