import { format } from 'date-fns'
import { AdjustmentResponseType } from '../types/types'
/**
 * Nối tiền tố Base64 vào chuỗi Base64 thuần
 * @param {string} base64 - Chuỗi Base64 thuần (không có tiền tố)
 * @param {string} [type='jpeg'] - Loại hình ảnh (jpeg, png, webp, v.v.)
 * @returns {string} Chuỗi Base64 đầy đủ với tiền tố
 */
export function addBase64Prefix(base64: string, type = 'jpeg') {
    // Loại bỏ tiền tố nếu chuỗi đã có (đề phòng trường hợp đầu vào không thuần)
    const cleanBase64 = base64.replace(/^data:image\/[a-z]+;base64,/, '')
    // Nối tiền tố với loại hình ảnh
    return `data:image/${type};base64,${cleanBase64}`
}

// Tạo chuỗi datetime
export const getFormattedDateTime = (formatStr = 'yyyy-MM-dd HH:mm:ss') => {
    return format(new Date(), formatStr)
}

// Helper function to map face shapes to Vietnamese names
const faceShapeMapping: Record<string, string> = {
    oval: 'Mặt Trái Xoan',
    round: 'Mặt Tròn',
    square: 'Mặt Vuông',
    heart: 'Mặt Trái Tim',
    diamond: 'Mặt Kim Cương',
    oblong: 'Mặt Dài',
    triangle: 'Mặt Tam Giác'
}

/**
 * Function to convert face shape to Vietnamese name
 */
export const getFaceShapeVietnamese = (faceShape: AdjustmentResponseType | null): string => {
    if (!faceShape || !faceShape.face_shape) return 'Không xác định'

    // Check for error status
    if (faceShape.face_shape.status === 'error') {
        return 'Không xác định'
    }

    // Get shape from data
    const shape = faceShape.face_shape.shape?.toLowerCase()

    // Return Vietnamese name if available in mapping, otherwise return original shape
    return shape ? faceShapeMapping[shape] || shape : 'Không xác định'
}

export const getFaceShapeVietnameseString = (faceShape: string): string => {
    if (!faceShape) return 'Không xác định'

    // Check for error status
    if (faceShape === 'error') {
        return 'Không xác định'
    }

    // Get shape from data
    const shape = faceShape?.toLowerCase()

    // Return Vietnamese name if available in mapping, otherwise return original shape
    return shape ? faceShapeMapping[shape] || shape : 'Không xác định'
}

export const convertImageUrlToBase64 = async (imageUrl: string): Promise<string> => {
    try {
        // Fetch hình ảnh từ URL
        const response = await fetch(imageUrl)
        const blob = await response.blob()

        // Chuyển đổi blob thành base64
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64String = reader.result as string
                // Bỏ phần đầu data URL (ví dụ: data:image/jpeg;base64,)
                const base64Data = base64String.split(',')[1]
                resolve(base64Data)
            }
            reader.onerror = reject
            reader.readAsDataURL(blob)
        })
    } catch (error) {
        console.error('Error converting image to base64:', error)
        throw error
    }
}
