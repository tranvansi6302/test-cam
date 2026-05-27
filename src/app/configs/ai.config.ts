import { EyebrowParams } from '../types/types'

/**
 * Default các tham số
 */
// input_image: '', // Hình ảnh đầu vào dạng base64
// eyebrow_left_path: 1, // Mặc định chọn mẫu chân mày đầu tiên
// apply_makeup: true, // Không áp dụng trang điểm
// show_landmarks: true, // Hiển thị điểm đánh dấu
// definition: 'SHARPEN', // Định nghĩa sắc nét
// color_eyebrow: 0, // Màu mặc định (màu gốc)
// remove_eyebrows: true, // Không xóa chân mày gốc

export const DEFAULT_CONFIG_ADJUSTMENT = {
    INPUT_IMAGE: '',
    EYEBROW_LEFT_PATH: 1,
    APPLY_MAKEUP: true,
    SHOW_LANDMARKS: false,
    DEFINITION: 'SHARPEN',
    COLOR_EYEBROW: 0,
    REMOVE_EYEBROWS: true
}

/**
 * Thông số mặc định cho chân mày trái
 */
export const DEFAULT_LEFT_PARAMS: EyebrowParams = {
    width_scale: 1.0,
    height_scale: 1.0,
    horizontal_offset: 0,
    vertical_offset: 0,
    rotation_angle: 0
}

/**
 * Thông số mặc định cho chân mày phải
 */
export const DEFAULT_RIGHT_PARAMS: EyebrowParams = {
    width_scale: 1.0,
    height_scale: 1.0,
    horizontal_offset: 0,
    vertical_offset: 0,
    rotation_angle: 0
}
