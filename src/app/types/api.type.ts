// Interface for the entire response
export interface ApiResponse<T> {
    statusCode: number
    isSuccess: boolean
    data: T
}

export interface LoginEmployeeRequestType {
    empCode: string
    password: string
}

export interface LoginResponseType {
    id: number
    fullName: string
    token: string
}

