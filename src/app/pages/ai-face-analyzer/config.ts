// Cấu hình cho ứng dụng thử chân mày

// Kích thước mặc định ban đầu của drop zone
export const DEFAULT_DROPZONE = {
    width: 400,
    height: 400
}

// Kích thước chân mày gốc (kích thước ban đầu)
export const ORIGINAL_EYEBROW = {
    width: 140,
    height: 38
}

// Hàm chuyển đổi vị trí khi thay đổi kích thước
export const convertPosition = (
    x: number,
    y: number,
    oldWidth: number,
    oldHeight: number,
    newWidth: number,
    newHeight: number
) => {
    // Tính toán tỷ lệ theo chiều rộng và chiều cao
    const widthRatio = newWidth / oldWidth
    const heightRatio = newHeight / oldHeight

    // Trả về vị trí mới sau khi nhân với tỷ lệ
    return {
        x: x * widthRatio,
        y: y * heightRatio
    }
}

// Hàm chuyển đổi vị trí đã lưu sang kích thước mới
export const convertSavedPositions = (
    positions: Array<{ id: string; name: string; image: string; position: { x: number; y: number }; flip?: boolean }>,
    oldWidth: number,
    oldHeight: number,
    newWidth: number,
    newHeight: number
) => {
    return positions.map((item) => {
        const newPosition = convertPosition(item.position.x, item.position.y, oldWidth, oldHeight, newWidth, newHeight)

        return {
            ...item,
            position: newPosition
        }
    })
}

// Hàm tính toán vị trí giới hạn cho chân mày dựa trên kích thước mới
export const configGetClampedPosition = (
    x: number,
    isRightEyebrow: boolean,
    oppositeX: number | null,
    dropZoneWidth: number,
    eyebrowWidth: number
): number => {
    if (isRightEyebrow) {
        // Chân mày phải: giới hạn bên trái là vị trí của chân mày trái + 1/2 chiều rộng chân mày
        const minX = oppositeX ? oppositeX + eyebrowWidth / 2 : 0
        // Giới hạn bên phải là chiều rộng drop zone - chiều rộng chân mày + thêm không gian để kéo sang phải
        const maxX = dropZoneWidth - eyebrowWidth / 2
        return Math.max(minX, Math.min(x, maxX))
    } else {
        // Chân mày trái: giới hạn bên trái là 0
        const minX = 0
        // Giới hạn bên phải là vị trí của chân mày phải - 1/2 chiều rộng chân mày
        const maxX = oppositeX ? oppositeX - eyebrowWidth / 2 : dropZoneWidth - eyebrowWidth
        return Math.max(minX, Math.min(x, maxX))
    }
}

// Lưu trữ key cho localStorage
export const STORAGE_KEYS = {
    EYEBROW_IMAGE: 'eyebrowImage',
    PLACED_BOXES: 'placedBoxes',
    DROPZONE_SIZE: 'dropzoneSize' // Lưu kích thước dropzone để so sánh khi load lại
}
