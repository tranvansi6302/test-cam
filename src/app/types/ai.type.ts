/**
 * Các thông số điều chỉnh chân mày
 */
interface EyebrowParams {
    width_scale: number // Tỷ lệ chiều rộng
    height_scale: number // Tỷ lệ chiều cao
    horizontal_offset: number // Độ dịch ngang
    vertical_offset: number // Độ dịch dọc
    rotation_angle: number // Góc xoay
}

interface AdjustParams {
    left: EyebrowParams // Chân mày trái
    right: EyebrowParams // Chân mày phải
}

export interface AdjustmentRequestType {
    input_image: string // Hình ảnh đầu vào dạng base64 (đã loại bỏ tiền tố)
    eyebrow_left_path: number // Mẫu chân mày được chọn (1 hoặc 2)
    apply_makeup: boolean // Áp dụng trang điểm
    remove_eyebrows: boolean // Xóa chân mày gốc
    definition: string // Định nghĩa (SHARP, SOFT, ...)
    color_eyebrow: number // Màu chân mày (0: đen, 1: màu gốc)
    show_landmarks: boolean // Hiển thị điểm đánh dấu
    adjust_params: AdjustParams // Thông số điều chỉnh
}
