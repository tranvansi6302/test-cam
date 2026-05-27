/**
 * Configuration interface for eyebrow parameters
 */
export interface EyebrowParams {
    width_scale: number
    height_scale: number
    horizontal_offset: number
    vertical_offset: number
    rotation_angle: number
}

/**
 * Configuration interface for adjustment parameters
 */
export interface AdjustParams {
    left: EyebrowParams
    right: EyebrowParams
}

/**
 * Configuration interface for API requests
 */
export interface Config {
    input_image: string
    eyebrow_left_path: number
    apply_makeup: boolean
    remove_eyebrows: boolean
    definition: string
    color_eyebrow: number
    show_landmarks: boolean
    adjust_params: AdjustParams
}
// Định nghĩa kiểu cho một điểm tọa độ 2D
interface Point {
    [index: number]: number // Ví dụ: [x, y]
}

// Định nghĩa kiểu cho một đường thẳng (gồm 2 điểm)
type Line = [Point, Point]

// Định nghĩa kiểu cho một tam giác (3 điểm)
type Triangle = [Point, Point, Point]

// Interface tổng thể cho dữ liệu
interface FaceLines {
    horizontal_line: Line
    triangle_line: Triangle
    vertical_line_left_eye: Line
    vertical_line_left_nose: Line
    vertical_line_midface: Line
    vertical_line_right_eye: Line
    vertical_line_right_nose: Line
}

export interface AdjustmentResponseType {
    difference: string
    eyebrow_1: string
    eyebrow_2: string
    eyebrow_3: string
    eyebrow_recommendation: string
    eyebrow_skeleton_data: EyebrowSkeletonData
    face_shape: FaceShape
    face_shape_description: string
    golden_face_ratio: string
    input_final_b64_string: string
    message: string
    output_remove_eyebrows_final_b64_string: string
    output_with_eyebrows_orginal_final_b64_string: string
    product_recommendation: string
    trend_recommendation: string
    your_face_ratio: string
    golden_ratio_match_percentage: number
    eyes_brows: EyebrowPointType
    draw_line_point: FaceLines
}

export type EyebrowPointType = {
    pts_down_left_brows: number[][]

    pts_down_right_brows: number[][]

    pts_left_brows: number[][]

    pts_right_brows: number[][]

    pts_up_left_brows: number[][]

    pts_up_right_brows: number[][]
    center_points: number[][]
    left_points: number[][]
    right_points: number[][]

    status: string
}

interface EyebrowSkeletonData {
    left_end: [number, number]
    left_end_to_nose_mm: number
    left_length: number
    left_mid_end_to_nose_mm: number
    left_mid_to_end: [number, number]
    left_mid_to_start: [number, number]
    left_middle: [number, number]
    left_middle_to_nose_mm: number
    left_start: [number, number]
    left_start_to_nose_mm: number

    nose_left: [number, number]
    nose_right: [number, number]

    right_end: [number, number]
    right_end_to_nose_mm: number
    right_length: number
    right_mid_end_to_nose_mm: number
    right_mid_to_end: [number, number]
    right_mid_to_start: [number, number]
    right_middle: [number, number]
    right_middle_to_nose_mm: number
    right_start: [number, number]
    right_start_to_nose_mm: number
}

export interface FaceShape {
    cheek_ratio: number
    chin_ratio: number
    forehead_ratio: number
    head_ratio: number
    jaw_angle: number
    jaw_ratio: number
    shape: string
    status: string
}
