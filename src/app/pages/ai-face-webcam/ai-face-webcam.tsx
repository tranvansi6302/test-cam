/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FaceDetector, FaceLandmarker, FilesetResolver, NormalizedLandmark } from '@mediapipe/tasks-vision'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import FacePreview from './_components/face-preview'
import PhotoGuidePanel from './_components/photo-guide'
import ProcessPanel from './_components/process-panel'
import './ai-face-webcam.css'
import LoadingAiFace from '../../components/loading-ai-face'
import { RefreshCw, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'



// ========== KHAI BÁO MÀU SẮC ==========
// Màu chính cho các thành phần
const COLORS = {
    // Màu cho các điểm, đường kẻ khi được kích hoạt (active)
    ACTIVE: {
        // Màu trục X và điểm mắt khi căn chỉnh đúng
        EYE_AXIS: 'rgba(0, 255, 65, 0.6)', // Bright green for better visibility
        EYE_POINT: 'rgba(0, 255, 65, 0.6)', // Matching bright green for eye points
        // Màu trục Y và điểm mũi khi căn chỉnh đúng
        NOSE_AXIS: 'rgba(0, 255, 65, 0.6)', // Xanh dương nhẹ
        NOSE_POINT: 'rgba(0, 255, 65, 0.6)', // Xanh dương nhẹ cho điểm mũi
        // Màu đường viền khuôn mặt
        FACE_OUTLINE: '#21BF73', // Xanh dương-tím nhẹ
        // Màu các điểm landmark
        FACE_POINT: '#ffffff', // Trắng
        EYE_LANDMARK: '#75c2f6', // Xanh dương nhạt
        NOSE_LANDMARK: '#dbc4f0', // Tím nhạt
        EYEBROW_LANDMARK: '#cea5fb', // Tím nhạt cho lông mày
        // Màu tỉ lệ vàng
        GOLDEN_RATIO: 'rgba(186, 190, 245, 0.5)', // Xanh-tím pastel
        GOLDEN_POINT: 'rgba(186, 190, 245, 0.7)' // Xanh-tím pastel cho điểm
    },

    // ========== MÀU KHI CẢ TRỤC X VÀ Y ĐỀU ACTIVE (PERFECT ALIGNMENT) ==========
    PERFECT_ALIGNMENT: {
        // Màu khi cả trục X và Y đều active - Xanh lá sáng để thể hiện hoàn hảo
        EYE_AXIS: '#00FF41', // Xanh lá sáng cho trục X (mắt) khi hoàn hảo
        EYE_POINT: '#00FF41', // Xanh lá sáng cho điểm mắt khi hoàn hảo
        NOSE_AXIS: '#00FF41', // Xanh lá sáng cho trục Y (mũi) khi hoàn hảo
        NOSE_POINT: '#00FF41', // Xanh lá sáng cho điểm mũi khi hoàn hảo

        // Màu đường viền khuôn mặt khi hoàn hảo
        FACE_OUTLINE: '#00FF41', // Xanh lá sáng cho viền mặt khi cả 2 trục active

        // Màu các điểm landmark khi hoàn hảo
        FACE_POINT: '#FFFFFF', // Trắng sáng cho điểm khuôn mặt
        EYE_LANDMARK: '#4ADE80', // Xanh lá nhạt cho điểm mắt
        NOSE_LANDMARK: '#4ADE80', // Xanh lá nhạt cho điểm mũi
        EYEBROW_LANDMARK: '#22C55E', // Xanh lá đậm cho lông mày khi hoàn hảo

        // Màu tỉ lệ vàng khi hoàn hảo
        GOLDEN_RATIO: 'rgba(34, 197, 94, 0.6)', // Xanh lá nhẹ cho đường tỉ lệ vàng
        GOLDEN_POINT: 'rgba(34, 197, 94, 0.8)', // Xanh lá đậm cho điểm tỉ lệ vàng

        // Màu lưới căn chỉnh khi hoàn hảo
        GRID_LINE: 'rgba(0, 255, 65, 0.3)', // Xanh lá nhẹ cho lưới
        GRID_CENTER: 'rgba(0, 255, 65, 0.5)', // Xanh lá đậm cho đường chính giữa

        // Màu trung tâm khi hoàn hảo
        CENTER_POINT: 'rgba(255, 255, 255, 1.0)' // Trắng sáng tối đa
    },

    // ========== MÀU CHO CÁC ĐIỂM TRÊN KHUÔN MẶT - 2 TRẠNG THÁI ==========
    FACE_LANDMARKS: {
        // Trạng thái bình thường - khi khuôn mặt trong khung nhưng chưa căn chỉnh hoàn hảo
        NORMAL: {
            // Các điểm viền khuôn mặt
            CONTOUR_POINT: 'rgba(255, 255, 255, 1.0)', // Vàng kim cho điểm viền
            CONTOUR_LINE: '#FFA500', // Cam nhạt cho đường nối các điểm viền

            // Các điểm đặc trưng khuôn mặt
            EYE_POINT: '#87CEEB', // Xanh trời nhạt cho điểm mắt
            NOSE_POINT: '#DDA0DD', // Tím nhạt cho điểm mũi
            EYEBROW_POINT: '#F0E68C', // Vàng khaki cho điểm lông mày
            MOUTH_POINT: '#F5DEB3', // Wheat cho điểm miệng

            // Đường nối các điểm
            EYE_LINE: 'rgba(135, 206, 235, 0.6)', // Đường nối điểm mắt
            NOSE_LINE: 'rgba(221, 160, 221, 0.6)', // Đường nối điểm mũi
            EYEBROW_LINE: 'rgba(240, 230, 140, 0.6)', // Đường nối điểm lông mày
            MOUTH_LINE: 'rgba(245, 222, 179, 0.6)', // Đường nối điểm miệng
            CONTOUR_LINE_OPACITY: 'rgba(255, 165, 0, 0.5)' // Đường viền mặt với độ trong suốt
        },

        // Trạng thái active - khi cả trục X và Y đều active (hoàn hảo)
        ACTIVE: {
            // Các điểm viền khuôn mặt khi active
            CONTOUR_POINT: 'rgba(50, 205, 50, 0.7)', // Xanh lá spring cho điểm viền
            CONTOUR_LINE: '#32CD32', // Xanh lá lime cho đường nối các điểm viền

            // Các điểm đặc trưng khuôn mặt khi active
            EYE_POINT: 'rgba(50, 205, 50, 0.7)', // Xanh ngọc đậm cho điểm mắt
            NOSE_POINT: 'rgba(50, 205, 50, 0.7)', // Tím trung bình cho điểm mũi
            EYEBROW_POINT: 'rgba(50, 205, 50, 0.7)', // Vàng kim cho điểm lông mày
            MOUTH_POINT: '#FF6347', // Đỏ cà chua cho điểm miệng

            // Đường nối các điểm khi active
            EYE_LINE: 'rgba(0, 206, 209, 0.8)', // Đường nối điểm mắt sáng hơn
            NOSE_LINE: 'rgba(147, 112, 219, 0.8)', // Đường nối điểm mũi sáng hơn
            EYEBROW_LINE: 'rgba(255, 215, 0, 0.8)', // Đường nối điểm lông mày sáng hơn
            MOUTH_LINE: 'rgba(255, 99, 71, 0.8)', // Đường nối điểm miệng sáng hơn
            CONTOUR_LINE_OPACITY: 'rgba(50, 205, 50, 0.7)' // Đường viền mặt active với độ trong suốt
        }
    },

    // Màu cho các điểm, đường kẻ khi không được kích hoạt (inactive)
    INACTIVE: {
        AXIS: 'rgba(255, 255, 255, 0.4)', // Trắng mờ
        POINT: 'rgba(255, 255, 255, 0.4)' // Trắng mờ
    },

    // Màu điểm nhỏ trung tâm
    CENTER_POINT: 'rgba(255, 255, 255, 0.9)', // Trắng sáng

    // Màu hiệu ứng bóng mờ
    SHADOW: {
        EYE_AXIS: 'rgba(117, 194, 246, 0.5)', // Bóng mờ xanh dương nhạt
        NOSE_AXIS: 'rgba(86, 153, 255, 0.5)', // Bóng mờ xanh dương nhẹ
        FACE_OUTLINE: 'rgba(120, 140, 255, 0.5)', // Bóng mờ xanh dương-tím nhẹ
        GOLDEN_RATIO: 'rgba(186, 190, 245, 0.3)', // Bóng mờ xanh-tím pastel
        GOLDEN_POINT: 'rgba(186, 190, 245, 0.6)', // Bóng mờ điểm tỉ lệ vàng

        // ========== BÓNG MỜ KHI HOÀN HẢO ==========
        PERFECT_EYE_AXIS: 'rgba(0, 255, 65, 0.6)', // Bóng xanh lá cho trục mắt hoàn hảo
        PERFECT_NOSE_AXIS: 'rgba(0, 255, 65, 0.6)', // Bóng xanh lá cho trục mũi hoàn hảo
        PERFECT_FACE_OUTLINE: 'rgba(0, 255, 65, 0.5)', // Bóng xanh lá cho viền mặt hoàn hảo
        PERFECT_GOLDEN_RATIO: 'rgba(34, 197, 94, 0.4)', // Bóng xanh lá cho tỉ lệ vàng hoàn hảo
        PERFECT_GOLDEN_POINT: 'rgba(34, 197, 94, 0.7)', // Bóng xanh lá cho điểm tỉ lệ vàng hoàn hảo

        // ========== BÓNG MỜ CHO FACE LANDMARKS ==========
        // Bóng mờ trạng thái bình thường
        NORMAL_CONTOUR: 'rgba(255, 215, 0, 0.3)', // Bóng vàng cho điểm viền
        NORMAL_EYE: 'rgba(135, 206, 235, 0.4)', // Bóng xanh trời cho điểm mắt
        NORMAL_NOSE: 'rgba(221, 160, 221, 0.4)', // Bóng tím cho điểm mũi
        NORMAL_EYEBROW: 'rgba(240, 230, 140, 0.4)', // Bóng vàng khaki cho lông mày

        // Bóng mờ trạng thái active
        ACTIVE_CONTOUR: 'rgba(0, 255, 127, 0.5)', // Bóng xanh lá spring cho điểm viền
        ACTIVE_EYE: 'rgba(0, 206, 209, 0.6)', // Bóng xanh ngọc cho điểm mắt
        ACTIVE_NOSE: 'rgba(147, 112, 219, 0.6)', // Bóng tím cho điểm mũi
        ACTIVE_EYEBROW: 'rgba(255, 215, 0, 0.6)' // Bóng vàng kim cho lông mày
    }
}

// Cấu hình style (kích thước, bóng đổ)
const STYLE = {
    ACTIVE: {
        LINE_WIDTH: 8.5, // Highly visible active lines (up from 5.0)
        SHADOW_BLUR: 12, // Active glow
        POINT_SIZE: 15.0, // Large, prominent active point size (up from 10.5)
        CENTER_POINT_SIZE: 5.0 // Prominent center white point size (up from 3.5)
    },
    INACTIVE: {
        LINE_WIDTH: 5.5, // Highly visible inactive lines (up from 3.0)
        SHADOW_BLUR: 0,
        POINT_SIZE: 11.5, // Large, prominent inactive point size (up from 7.5)
        LINE_DASH: [6, 6]
    },
    FACE_OUTLINE: {
        LINE_WIDTH: 3.0, // Thicker face outline
        SHADOW_BLUR: 6
    },
    LANDMARK: {
        POINT_SIZE: 4.5, // Larger landmark point size
        STROKE_WIDTH: 1.2,
        SHADOW_BLUR: 10
    },
    GOLDEN_RATIO: {
        LINE_WIDTH: 2.5,
        SHADOW_BLUR: 5,
        POINT_SIZE: 4.5,
        CENTER_POINT_SIZE: 2.0,
        LINE_DASH: [3, 4]
    }
}
// ========== KẾT THÚC KHAI BÁO MÀU SẮC ==========

export interface DetectionWithBoundingBox {
    boundingBox: BoundingBox
    categories?: any
}

export interface BoundingBox {
    originX: number
    originY: number
    width: number
    height: number
    angle?: number
}

interface LocalFaceGuidance {
    isDetected: boolean
    tiltMessage: string
    allCriteriaMet: boolean
    isAxesAligned: boolean
    isCentered?: boolean
    isCorrectDistance?: boolean
    isCompletelyWithinOval?: boolean
    bypassOvalCheck?: boolean
    bothPupilsAligned?: boolean
    noseAligned?: boolean
}

interface FaceAlignment {
    centerX: number
    centerY: number
    radiusX: number
    radiusY: number
    roll: number
    leftPupil: { x: number; y: number }
    rightPupil: { x: number; y: number }
    noseTip: { x: number; y: number }
}

interface ImageDimensions {
    width: number
    height: number
}

export default function AIFaceWebcam({
    onCapture,
    shouldCapture = false
}: {
    onCapture: (base64Image: string) => void
    shouldCapture?: boolean
}) {
    const navigate = useNavigate()
    const webcamRef = useRef<Webcam>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [detector, setDetector] = useState<FaceDetector | null>(null)
    const [landmarker, setLandmarker] = useState<FaceLandmarker | null>(null)
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')

    const toggleCamera = useCallback(() => {
        setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
    }, [])
    const [, setFace] = useState<DetectionWithBoundingBox | null>(null)
    const [, setCurrentLandmarks] = useState<NormalizedLandmark[]>([])
    const [isCapturing, setIsCapturing] = useState(false)
    const [captureProgress, setCaptureProgress] = useState(0)
    const captureStartTimeRef = useRef<number | null>(null)
    const captureAnimationRef = useRef<number | null>(null)
    // These state variables are needed for the functionality but not directly used in rendering
    const [, setCapturedImageSrc] = useState('')
    const [, setLastCapturedOriginal] = useState('')
    const [cameraReady, setCameraReady] = useState(false)
    // const [, setShowCaptureModal] = useState(false)
    const [guidance, setGuidance] = useState<LocalFaceGuidance>({
        isDetected: false,
        tiltMessage: '',
        allCriteriaMet: false,
        isAxesAligned: false,
        isCompletelyWithinOval: false,
        bypassOvalCheck: false
    })
    const [stableFramesCount, setStableFramesCount] = useState(0)
    const [isAutoCapturing, setIsAutoCapturing] = useState(false)
    const [, setShowNotification] = useState(false)
    const autoCaptureDoneRef = useRef<boolean>(false)
    const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    // Add refs for caching previous results to improve performance
    const previousDetectionsRef = useRef<DetectionWithBoundingBox | null>(null)
    const previousLandmarksRef = useRef<NormalizedLandmark[]>([])
    const emaLandmarksRef = useRef<Record<number, { x: number; y: number }>>({})
    const isProcessingFrameRef = useRef<boolean>(false) // Async lock to prevent parallel MediaPipe frames piling up
    const skipFrameCount = useRef<number>(0)
    const [previewImageSrc, setPreviewImageSrc] = useState('')
    const [isProcessingCapture, setIsProcessingCapture] = useState(false)
    const [isSavingData, setIsSavingData] = useState(false)
    const [isStartingCapture, setIsStartingCapture] = useState(false) // New state for starting capture

    // Constants
    const STABILITY_THRESHOLD = 3 // Increase from 1 to 3 frames for more stable capture
    const UPDATE_INTERVAL = 33 // 33ms (~30fps) by default for power-efficient and silky-smooth mobile tracking

    const videoConstraints = useMemo(
        () => ({
            width: 1920,
            height: 1080,
            facingMode: facingMode,
            aspectRatio: 3 / 4
        }),
        [facingMode]
    )

    // Initialize detectors
    const initializeDetectors = useCallback(async () => {
        setIsLoading(true)
        const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm')
        const faceDetector = await FaceDetector.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath:
                    'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
                delegate: 'GPU'
            },
            runningMode: 'VIDEO'
        })
        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath:
                    'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                delegate: 'GPU'
            },
            outputFaceBlendshapes: true,
            outputFacialTransformationMatrixes: true,
            runningMode: 'VIDEO',
            numFaces: 1
        })
        setDetector(faceDetector)
        setLandmarker(faceLandmarker)

        // Only finish loading when both models AND camera are ready
        if (cameraReady) {
            setTimeout(() => setIsLoading(false), 2000)
        }
    }, [cameraReady])

    // Handle camera ready state
    const handleCameraReady = useCallback(() => {
        console.log('Camera is ready')
        setCameraReady(true)

        // If models are already loaded, finish the loading process
        if (detector && landmarker) {
            setTimeout(() => setIsLoading(false), 2000)
        }
    }, [detector, landmarker])

    useEffect(() => {
        initializeDetectors()
    }, [initializeDetectors])

    // Handle recapture
    // const handleRecapture = useCallback(() => {
    //     setShowCaptureModal(false)
    //     setCapturedImageSrc('')
    //     autoCaptureDoneRef.current = false // Allow capturing again
    // }, [])

    // Enhance the auto-capture effect when shouldCapture changes
    useEffect(() => {
        if (shouldCapture && !autoCaptureDoneRef.current) {
            console.log('=== CAMERA MODAL: CHUYỂN SANG CHẾ ĐỘ TỰ ĐỘNG CHỤP ===')
            autoCaptureDoneRef.current = false
            setIsAutoCapturing(true)
        }
    }, [shouldCapture])

    // Reset autocapture flag when component is mounted or shouldCapture changes
    useEffect(() => {
        // Reset the flag when shouldCapture prop changes
        autoCaptureDoneRef.current = false

        return () => {
            autoCaptureDoneRef.current = false
        }
    }, [shouldCapture])

    // Function to crop image to just the face with padding
    const cropFaceFromImage = (
        imageData: string,
        boundingBox: BoundingBox,
        landmarks: NormalizedLandmark[] = [],
        padding = 0.2, // Giảm padding xuống 20%
        targetWidth = 600, // Chiều rộng mục tiêu cho ảnh đầu ra
        targetHeight = 800, // Chiều cao mục tiêu cho ảnh đầu ra (tỷ lệ 3:4)
        keepOriginalRatio = false // Thêm tham số để giữ nguyên tỷ lệ gốc
    ): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')

                if (!ctx) {
                    console.error('Failed to get canvas context for face cropping')
                    resolve(imageData) // Return original if failed
                    return
                }

                let cropX, cropY, cropWidth, cropHeight

                // Nếu có landmarks, sử dụng chúng để cắt chính xác hơn
                if (landmarks && landmarks.length >= 468) {
                    // Tìm điểm mốc ngoài cùng của khuôn mặt
                    let minX = 1,
                        minY = 1,
                        maxX = 0,
                        maxY = 0

                    // Các điểm mốc đường viền khuôn mặt
                    const contourIndices = [
                        // Viền khuôn mặt
                        10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176,
                        149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109
                    ]

                    // Chỉ sử dụng các điểm viền để xác định ranh giới
                    contourIndices.forEach((index) => {
                        if (landmarks[index]) {
                            minX = Math.min(minX, landmarks[index].x)
                            minY = Math.min(minY, landmarks[index].y)
                            maxX = Math.max(maxX, landmarks[index].x)
                            maxY = Math.max(maxY, landmarks[index].y)
                        }
                    })

                    // Đảm bảo có tỷ lệ cắt hợp lý
                    if (maxX - minX > 0 && maxY - minY > 0) {
                        // Chuyển đổi tỷ lệ thành pixel
                        cropX = minX * img.width
                        cropY = minY * img.height
                        cropWidth = (maxX - minX) * img.width
                        cropHeight = (maxY - minY) * img.height

                        // Thêm padding tối thiểu
                        const paddingX = cropWidth * padding
                        const paddingY = cropHeight * padding

                        cropX = Math.max(0, cropX - paddingX)
                        cropY = Math.max(0, cropY - paddingY)
                        cropWidth = Math.min(img.width - cropX, cropWidth + paddingX * 2)
                        cropHeight = Math.min(img.height - cropY, cropHeight + paddingY * 2)
                    } else {
                        // Fallback to bounding box if landmarks calculation fails
                        cropX = Math.max(0, boundingBox.originX)
                        cropY = Math.max(0, boundingBox.originY)
                        cropWidth = Math.min(img.width - cropX, boundingBox.width)
                        cropHeight = Math.min(img.height - cropY, boundingBox.height)

                        // Thêm padding tối thiểu
                        const paddingX = cropWidth * padding
                        const paddingY = cropHeight * padding

                        cropX = Math.max(0, cropX - paddingX)
                        cropY = Math.max(0, cropY - paddingY)
                        cropWidth = Math.min(img.width - cropX, cropWidth + paddingX * 2)
                        cropHeight = Math.min(img.height - cropY, cropHeight + paddingY * 2)
                    }
                } else {
                    // Sử dụng bounding box nếu không có landmarks
                    // Thêm padding tối thiểu
                    const paddingX = boundingBox.width * padding
                    const paddingY = boundingBox.height * padding

                    cropX = Math.max(0, boundingBox.originX - paddingX)
                    cropY = Math.max(0, boundingBox.originY - paddingY)
                    cropWidth = Math.min(img.width - cropX, boundingBox.width + paddingX * 2)
                    cropHeight = Math.min(img.height - cropY, boundingBox.height + paddingY * 2)
                }

                // Đảm bảo kích thước tối thiểu
                cropWidth = Math.max(cropWidth, 100)
                cropHeight = Math.max(cropHeight, 100)

                // Nếu giữ nguyên tỷ lệ webcam
                if (keepOriginalRatio) {
                    // Tỉ lệ 3:4 như yêu cầu của người dùng
                    const targetRatio = 3 / 4 // width / height

                    // Đảm bảo vùng cắt có tỷ lệ 3:4
                    const cropRatio = cropWidth / cropHeight

                    // Điều chỉnh vùng cắt để có tỷ lệ 3:4
                    if (cropRatio > targetRatio) {
                        // Nếu vùng cắt quá rộng so với 3:4
                        // Giữ chiều cao, điều chỉnh chiều rộng để phù hợp
                        const newCropWidth = cropHeight * targetRatio
                        const widthDiff = cropWidth - newCropWidth
                        cropX = Math.max(0, cropX + widthDiff / 2)
                        cropWidth = newCropWidth
                    } else if (cropRatio < targetRatio) {
                        // Nếu vùng cắt quá cao so với 3:4
                        // Giữ chiều rộng, điều chỉnh chiều cao để phù hợp
                        const newCropHeight = cropWidth / targetRatio
                        const heightDiff = cropHeight - newCropHeight
                        cropY = Math.max(0, cropY + heightDiff / 2)
                        cropHeight = newCropHeight
                    }

                    // Đảm bảo cropWidth/cropHeight nằm trong giới hạn của ảnh
                    cropWidth = Math.min(img.width - cropX, cropWidth)
                    cropHeight = Math.min(img.height - cropY, cropHeight)

                    // Sử dụng tỉ lệ 3:4 cho kích thước đầu ra
                    if (targetWidth > 0 && targetHeight > 0) {
                        canvas.width = targetWidth
                        canvas.height = targetHeight
                    } else {
                        // Hoặc duy trì kích thước nhưng đảm bảo tỉ lệ 3:4
                        canvas.width = 600 // Chiều rộng mặc định
                        canvas.height = 800 // Chiều cao mặc định (tỉ lệ 3:4)
                    }
                } else {
                    // Nếu không giữ nguyên tỷ lệ webcam, sử dụng tỷ lệ 3:4 như trước
                    // Điều chỉnh để đạt được tỷ lệ 3:4 (width:height = 3:4)
                    const targetRatio = 3 / 4 // width / height
                    const currentRatio = cropWidth / cropHeight

                    // Tính toán kích thước mới để có tỷ lệ 3:4
                    let finalCropWidth = cropWidth
                    let finalCropHeight = cropHeight
                    let offsetX = 0
                    let offsetY = 0

                    if (currentRatio > targetRatio) {
                        // Nếu ảnh quá rộng so với tỷ lệ 3:4
                        // Giữ chiều cao, điều chỉnh chiều rộng để phù hợp
                        finalCropWidth = cropHeight * targetRatio
                        finalCropHeight = cropHeight
                        // Căn giữa theo chiều ngang
                        offsetX = (cropWidth - finalCropWidth) / 2
                    } else {
                        // Nếu ảnh quá cao so với tỷ lệ 3:4
                        // Giữ chiều rộng, điều chỉnh chiều cao để phù hợp
                        finalCropWidth = cropWidth
                        finalCropHeight = cropWidth / targetRatio
                        // Căn giữa theo chiều dọc
                        offsetY = (cropHeight - finalCropHeight) / 2
                    }

                    // Điều chỉnh vùng cắt để duy trì tỷ lệ 3:4 và vẫn căn giữa khuôn mặt
                    cropX = Math.max(0, cropX + offsetX)
                    cropY = Math.max(0, cropY + offsetY)
                    cropWidth = Math.min(img.width - cropX, finalCropWidth)
                    cropHeight = Math.min(img.height - cropY, finalCropHeight)

                    // Sử dụng kích thước target nếu được cung cấp
                    canvas.width = targetWidth > 0 ? targetWidth : 600
                    canvas.height = targetHeight > 0 ? targetHeight : 800
                }

                // Vẽ trực tiếp lên canvas chính
                ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height)

                // Convert to base64
                const croppedImage = canvas.toDataURL('image/jpeg', 1)
                resolve(croppedImage)
            }

            img.src = imageData
        })
    }

    // Enhance the captureImage function to better handle the captured image
    const captureImage = useCallback(() => {
        if (!webcamRef.current) return

        try {
            console.log('=== CAMERA MODAL: ĐANG CHỤP HÌNH ===')
            setIsStartingCapture(true) // Immediately show the overlay
            setIsProcessingCapture(true) // Start showing processing state immediately

            // Capture the image from webcam
            const rawImageSrc = webcamRef.current.getScreenshot()
            if (!rawImageSrc) {
                console.error('=== CAMERA MODAL: LỖI - KHÔNG TẠO ĐƯỢC HÌNH ẢNH ===')
                setIsProcessingCapture(false)
                setIsStartingCapture(false)
                return
            }

            console.log('=== CAMERA MODAL: ĐÃ CHỤP HÌNH THÀNH CÔNG, LẬT HÌNH ĐỂ ĐÚNG VỚI THỰC TẾ ===')

            // Flip the image horizontally to match real-world orientation
            const img = new Image()
            img.onload = async () => {
                const canvas = document.createElement('canvas')
                canvas.width = img.width
                canvas.height = img.height

                const ctx = canvas.getContext('2d')
                if (!ctx) {
                    console.error('=== CAMERA MODAL: LỖI - KHÔNG TẠO ĐƯỢC CONTEXT CANVAS ===')
                    setIsProcessingCapture(false)
                    setIsStartingCapture(false)
                    return
                }

                // Flip horizontally by translating and scaling ONLY for user camera
                if (facingMode === 'user') {
                    ctx.translate(canvas.width, 0)
                    ctx.scale(-1, 1)
                }
                ctx.drawImage(img, 0, 0)

                // Get the flipped image
                const flippedImage = canvas.toDataURL('image/jpeg', 1.0)

                // Check if we have face detection data
                let finalImage = flippedImage
                // Get the current face detection if available
                const currentDetection = previousDetectionsRef.current
                const currentLandmarks = previousLandmarksRef.current || []

                if (currentDetection && currentDetection.boundingBox) {
                    console.log('=== CAMERA MODAL: PHÁT HIỆN KHUÔN MẶT, TIẾN HÀNH CẮT ẢNH ===')

                    // We need to adjust the bounding box to account for the flipped image if user camera
                    const adjustedBoundingBox = {
                        ...currentDetection.boundingBox,
                        originX: facingMode === 'user'
                            ? canvas.width - (currentDetection.boundingBox.originX + currentDetection.boundingBox.width)
                            : currentDetection.boundingBox.originX
                    }

                    try {
                        // Giữ nguyên tỷ lệ webcam khi cắt khuôn mặt
                        finalImage = await cropFaceFromImage(
                            flippedImage,
                            adjustedBoundingBox,
                            currentLandmarks,
                            0.3, // Padding 30% để đảm bảo đủ không gian xung quanh khuôn mặt
                            canvas.width, // Sử dụng chiều rộng thực tế của canvas
                            canvas.height, // Sử dụng chiều cao thực tế của canvas
                            true // Giữ nguyên tỷ lệ webcam
                        )
                        console.log('=== CAMERA MODAL: ĐÃ CẮT KHUÔN MẶT THÀNH CÔNG ===')
                    } catch (error) {
                        console.error('=== CAMERA MODAL: LỖI KHI CẮT KHUÔN MẶT ===', error)
                        finalImage = flippedImage // Fallback to full image on error
                    }
                } else {
                    console.log('=== CAMERA MODAL: KHÔNG TÌM THẤY KHUÔN MẶT ĐỂ CẮT, SỬ DỤNG ẢNH GỐC ===')
                }

                // Save the captured and processed image
                setCapturedImageSrc(finalImage)
                setLastCapturedOriginal(finalImage)

                // Set the preview image for automatic processing
                setPreviewImageSrc(finalImage)

                // Reset auto-capture state
                autoCaptureDoneRef.current = true
                setIsAutoCapturing(false)
                // We keep the processing state active until saving is complete
                // setIsProcessingCapture(false) // Don't end processing state until saving is done
                // Keep isStartingCapture true to ensure overlay stays visible

                // Pass the image directly to the parent component
                onCapture(finalImage)

                console.log('=== CAMERA MODAL: ĐÃ GỬI HÌNH ẢNH ĐẾN COMPONENT CHA ===')

                // Show success notification
                setShowNotification(true)
                setTimeout(() => {
                    setShowNotification(false)
                }, 3000)
            }

            img.src = rawImageSrc
        } catch (error) {
            console.error('=== CAMERA MODAL: LỖI KHI CHỤP HÌNH ===', error)
            setIsProcessingCapture(false)
            setIsStartingCapture(false)
        }
    }, [onCapture, facingMode])

    // Process video frame (Logic and Detection ONLY, no canvas drawing)
    const processFrame = useCallback(async () => {
        if (isProcessingFrameRef.current) return
        isProcessingFrameRef.current = true
        try {
            if (!detector || !landmarker || !webcamRef.current?.video) return

        const video = webcamRef.current.video
        if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) return

        const videoWidth = video.videoWidth
        const videoHeight = video.videoHeight

        const currentTime = performance.now()
        const detections = detector.detectForVideo(video, currentTime)

        // No face detected
        if (detections.detections.length === 0) {
            setFace(null)
            setCurrentLandmarks([])
            previousDetectionsRef.current = null
            previousLandmarksRef.current = []
            setGuidance({
                isDetected: false,
                tiltMessage: 'Vui lòng đưa khuôn mặt vào khung hình',
                allCriteriaMet: false,
                isAxesAligned: false,
                isCompletelyWithinOval: false,
                bypassOvalCheck: false
            })
            setStableFramesCount(0)
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current)
                progressIntervalRef.current = null
            }
            return
        }

        const detectedFace = detections.detections[0]
        if (!detectedFace.boundingBox) return

        // Only update face state if we have a valid bounding box
        if (detectedFace.boundingBox) {
            setFace({
                boundingBox: detectedFace.boundingBox,
                categories: detectedFace.categories || []
            })
        }

        const landmarkResult = await landmarker.detectForVideo(video, currentTime)
        const landmarks = landmarkResult.faceLandmarks?.[0] || []

        // Apply EMA smoothing to critical points to prevent shaking
        if (landmarks.length >= 478) {
            const alpha = 0.70 // High alpha for instantaneous tracking with subtle micro-jitter filter
            const ema = emaLandmarksRef.current
            const keyPoints = [1, 168, 133, 362]
            keyPoints.forEach((idx) => {
                if (landmarks[idx]) {
                    if (!ema[idx]) {
                        ema[idx] = { x: landmarks[idx].x, y: landmarks[idx].y }
                    } else {
                        ema[idx].x = alpha * landmarks[idx].x + (1 - alpha) * ema[idx].x
                        ema[idx].y = alpha * landmarks[idx].y + (1 - alpha) * ema[idx].y
                    }
                    landmarks[idx] = {
                        ...landmarks[idx],
                        x: ema[idx].x,
                        y: ema[idx].y
                    }
                }
            })
        }

        // Only update landmarks if they've changed significantly
        setCurrentLandmarks((prevLandmarks) => {
            if (prevLandmarks.length !== landmarks.length) {
                return landmarks
            }
            // Only update if key landmarks have moved significantly
            if (landmarks.length > 0 && prevLandmarks.length > 0) {
                const keyPoints = [1, 168, 133, 362] // Nose tip, chin, left inner corner, right inner corner
                for (const point of keyPoints) {
                    if (
                        !landmarks[point] ||
                        !prevLandmarks[point] ||
                        Math.abs(landmarks[point].x - prevLandmarks[point].x) > 0.01 ||
                        Math.abs(landmarks[point].y - prevLandmarks[point].y) > 0.01
                    ) {
                        return landmarks
                    }
                }
            }
            return prevLandmarks
        })

        if (landmarks.length === 0) {
            setGuidance({
                isDetected: false,
                tiltMessage: 'Không nhận diện được khuôn mặt',
                allCriteriaMet: false,
                isAxesAligned: false,
                isCompletelyWithinOval: false,
                bypassOvalCheck: false
            })
            setStableFramesCount(0)
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current)
                progressIntervalRef.current = null
            }
            previousDetectionsRef.current = null
            previousLandmarksRef.current = []
            return
        }

        // Cache the valid detection and smoothed landmarks for high-precision cropping
        previousDetectionsRef.current = {
            boundingBox: detectedFace.boundingBox,
            categories: detectedFace.categories || []
        }
        previousLandmarksRef.current = landmarks

        // Calculate parameters
        const idealWidth = videoWidth * (videoHeight > videoWidth ? 0.45 : 0.25)
        const idealCenterX = videoWidth / 2
        const idealCenterY = videoHeight * 0.45
        const radiusX = idealWidth / 2
        const radiusY = (idealWidth * 1.3) / 2

        // Use larger frame for initial detection - outer frame check
        const flippedBoundingBox = {
            ...detectedFace.boundingBox,
            originX: facingMode === 'user'
                ? videoWidth - (detectedFace.boundingBox.originX + detectedFace.boundingBox.width)
                : detectedFace.boundingBox.originX
        }

        // Kiểm tra xem khuôn mặt có nằm hoàn toàn trong khung oval ngoài không
        const outerRadiusX = radiusX * 1.1
        const outerRadiusY = radiusY * 1.1
        const isCompletelyWithinOuterOval = isFaceCompletelyWithinOuterOval(
            flippedBoundingBox,
            idealCenterX,
            idealCenterY,
            outerRadiusX,
            outerRadiusY,
            landmarks,
            videoWidth,
            videoHeight,
            facingMode === 'user' ? (x) => videoWidth - x : (x) => x
        )

        // Bỏ qua việc kiểm tra nằm trong khung
        const bypassOvalCheck = false

        // 1. FIRST CHECK: Is the face completely within the frame?
        if (!isCompletelyWithinOuterOval && !bypassOvalCheck) {
            // Xác định vị trí khuôn mặt so với khung
            const faceX = detectedFace.boundingBox.originX + detectedFace.boundingBox.width / 2
            const faceY = detectedFace.boundingBox.originY + detectedFace.boundingBox.height / 2

            let positionMessage = 'Di chuyển để khuôn mặt nằm trong khung hình vuông'

            // Xác định hướng di chuyển cụ thể
            if (faceX < idealCenterX - radiusX * 0.5) {
                positionMessage = 'Di chuyển sang PHẢI để khuôn mặt vào trong khung'
            } else if (faceX > idealCenterX + radiusX * 0.5) {
                positionMessage = 'Di chuyển sang TRÁI để khuôn mặt vào trong khung'
            } else if (faceY < idealCenterY - radiusY * 0.5) {
                positionMessage = 'Di chuyển XUỐNG để khuôn mặt vào trong khung'
            } else if (faceY > idealCenterY + radiusY * 0.5) {
                positionMessage = 'Di chuyển LÊN để khuôn mặt vào trong khung'
            }

            // Khuôn mặt không nằm đủ trong khung
            setGuidance({
                isDetected: true,
                tiltMessage: positionMessage,
                allCriteriaMet: false,
                isCentered: false,
                isCorrectDistance: true,
                isAxesAligned: false,
                isCompletelyWithinOval: false,
                bypassOvalCheck: bypassOvalCheck
            })

            setStableFramesCount(0)
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current)
                progressIntervalRef.current = null
            }
            return
        }

        // 3. Check: Are axes aligned?
        const faceAlignment: FaceAlignment = {
            centerX: idealCenterX,
            centerY: idealCenterY,
            radiusX,
            radiusY,
            roll: 0,
            leftPupil: { x: landmarks[133]?.x || 0, y: landmarks[133]?.y || 0 }, // Sử dụng khóe mắt trái trong
            rightPupil: { x: landmarks[362]?.x || 0, y: landmarks[362]?.y || 0 }, // Sử dụng khóe mắt phải trong
            noseTip: { x: landmarks[1]?.x || 0, y: landmarks[1]?.y || 0 }
        }

        const dimensions: ImageDimensions = {
            width: videoWidth,
            height: videoHeight
        }

        // Check both X (eyes) and Y (nose) alignment
        const eyesAlignment = checkEyesAlignment(landmarks)
        const noseAlignment = checkNoseAlignment(landmarks)

        const isAxesAligned =
            eyesAlignment && noseAlignment && landmarks.length >= 474
                ? isFaceAlignedWithFixedAxes(faceAlignment, dimensions, facingMode === 'user')
                : false

        // Get alignment status from checkFixedAxesAlignment helper
        const { bothPupilsAligned, noseAligned } = checkFixedAxesAlignment(
            landmarks,
            idealCenterX,
            idealCenterY,
            radiusY,
            videoWidth,
            videoHeight,
            facingMode === 'user'
        )

        // Face axes are not aligned properly, provide guidance
        if (!bothPupilsAligned || !noseAligned) {
            const isHorizontalAxisActive = bothPupilsAligned
            const isVerticalAxisActive = noseAligned

            let guidanceMessage = ''

            if (!isVerticalAxisActive) {
                // Căn chỉnh trục Y (sống mũi) trước
                if (landmarks[1]) {
                    const nose = landmarks[1]
                    const noseX = facingMode === 'user' ? (1 - nose.x) * videoWidth : nose.x * videoWidth
                    const diffFromCenter = noseX - idealCenterX

                    // Độ lệch trái phải của mũi so với trung tâm - thêm thông tin chi tiết hơn
                    if (diffFromCenter > 10) {
                        guidanceMessage = '← Nghiêng phải nhẹ ' + Math.round(diffFromCenter) + 'px'
                    } else if (diffFromCenter < -10) {
                        guidanceMessage = '→ Nghiêng trái nhẹ ' + Math.round(Math.abs(diffFromCenter)) + 'px'
                    } else {
                        guidanceMessage = '↕ Giữ sống mũi thẳng, chưa đủ chính xác'
                    }
                } else {
                    guidanceMessage = '↕ Căn chỉnh sống mũi thẳng 100%'
                }
            } else if (!isHorizontalAxisActive) {
                // Sau khi sống mũi đã thẳng, căn chỉnh trục X (mắt)
                if (landmarks[133] && landmarks[362]) {
                    const leftInnerCorner = landmarks[133] // Khóe mắt trái trong
                    const rightInnerCorner = landmarks[362] // Khóe mắt phải trong
                    const innerCornerYDiff = Math.abs(leftInnerCorner.y - rightInnerCorner.y) * videoHeight

                    if (leftInnerCorner.y > rightInnerCorner.y) {
                        guidanceMessage = '↺ Nghiêng trái nhẹ ' + Math.round(innerCornerYDiff) + 'px'
                    } else if (leftInnerCorner.y < rightInnerCorner.y) {
                        guidanceMessage = '↻ Nghiêng phải nhẹ ' + Math.round(innerCornerYDiff) + 'px'
                    } else {
                        guidanceMessage = '✦ Giữ mắt ngang, chưa đủ chính xác'
                    }
                } else {
                    guidanceMessage = '✦ Căn chỉnh mắt ngang 100%'
                }
            } else if (!checkFaceCentered(landmarks)) {
                guidanceMessage = '⊕ Vào giữ khung hình'
            } else {
                guidanceMessage = '✦ Tinh chỉnh lại khuôn mặt'
            }

            setGuidance({
                isDetected: true,
                tiltMessage: guidanceMessage,
                allCriteriaMet: false,
                isCentered: true,
                isCorrectDistance: true,
                isAxesAligned: true,
                isCompletelyWithinOval: isCompletelyWithinOuterOval,
                bypassOvalCheck: bypassOvalCheck,
                bothPupilsAligned,
                noseAligned
            })
            setStableFramesCount(0)
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current)
                progressIntervalRef.current = null
            }
            return
        }

        // All checks pass - perfect alignment
        const allLandmarksDetected =
            landmarks[133] &&
            landmarks[362] && // Hai khóe mắt trong
            landmarks[1] &&
            landmarks[168]

        // Sử dụng các hàm kiểm tra đã được cải thiện
        const isHorizontalAxisActive = checkEyesAlignment(landmarks)
        const isVerticalAxisActive = checkNoseAlignment(landmarks)

        // Determine if the face is in a stable position
        const isStable = stableFramesCount >= STABILITY_THRESHOLD

        // Fast track stability for perfectly aligned faces
        if (isHorizontalAxisActive && isVerticalAxisActive && !isStable) {
            setStableFramesCount(STABILITY_THRESHOLD)
        } else if (isHorizontalAxisActive && isVerticalAxisActive) {
            // Already stable and still aligned - do nothing
        } else {
            // Not aligned - reset stability
            setStableFramesCount(0)
        }

        // Use alignment results for further processing
        const facePerfectlyAligned =
            isCompletelyWithinOuterOval &&
            allLandmarksDetected &&
            isAxesAligned &&
            bothPupilsAligned &&
            noseAligned

        // Check if both X and Y axes are active
        const bothAxesActive = isHorizontalAxisActive && isVerticalAxisActive

        // Only update guidance state if there's a meaningful change
        setGuidance((prevGuidance) => {
            // Skip update if most critical states are the same
            if (
                prevGuidance.isDetected === true &&
                prevGuidance.bothPupilsAligned === bothPupilsAligned &&
                prevGuidance.noseAligned === noseAligned &&
                prevGuidance.isCompletelyWithinOval === isCompletelyWithinOuterOval &&
                prevGuidance.allCriteriaMet === facePerfectlyAligned
            ) {
                return prevGuidance
            }

            return {
                isDetected: true,
                tiltMessage: isCompletelyWithinOuterOval
                    ? bothPupilsAligned && noseAligned
                        ? 'Khuôn mặt đã chuẩn 100%'
                        : 'Hoàn hảo! Giữ nguyên tư thế'
                    : 'Giữ khuôn mặt nằm trong khung hình',
                allCriteriaMet: facePerfectlyAligned,
                isCentered: true,
                isCorrectDistance: true,
                isAxesAligned: true,
                isCompletelyWithinOval: isCompletelyWithinOuterOval,
                bypassOvalCheck: bypassOvalCheck,
                bothPupilsAligned: bothPupilsAligned,
                noseAligned: noseAligned
            }
        })

        // Auto capture logic - start countdown when both axes are active and hasn't been captured yet
        if (bothAxesActive && isStable && !isCapturing && !isAutoCapturing && !autoCaptureDoneRef.current) {
            console.log('=== CAMERA: KHUÔN MẶT ĐÃ CHUẨN (TRỤC X VÀ Y ACTIVE) - BẮT ĐẦU TIẾN TRÌNH ===')
            setIsCapturing(true)
            setIsAutoCapturing(true)
            setCaptureProgress(0)
            captureStartTimeRef.current = performance.now()

            // Bắt đầu animation tiến trình
            const animateProgress = (timestamp: number) => {
                if (!captureStartTimeRef.current) return

                const elapsed = timestamp - captureStartTimeRef.current
                const duration = 500 // 500ms for faster capture
                const progress = Math.min(100, (elapsed / duration) * 100)

                requestAnimationFrame(() => {
                    setCaptureProgress(progress)
                })

                if (progress < 100) {
                    captureAnimationRef.current = requestAnimationFrame(animateProgress)
                } else {
                    captureImage()
                    setIsCapturing(false)
                    setCaptureProgress(0)
                    captureStartTimeRef.current = null
                }
            }

            captureAnimationRef.current = requestAnimationFrame(animateProgress)
        } else if (shouldCapture && !autoCaptureDoneRef.current && !isCapturing) {
            console.log(
                '=== CAMERA: CHỜ KHUÔN MẶT CHUẨN === \nTrục X active:',
                isHorizontalAxisActive,
                '\nTrục Y active:',
                isVerticalAxisActive
            )
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current)
                progressIntervalRef.current = null
            }
        }
    } finally {
        isProcessingFrameRef.current = false
    }
}, [detector, landmarker, stableFramesCount, captureImage, shouldCapture, isAutoCapturing, facingMode])

    // Manage frame processing with improved throttling
    useEffect(() => {
        if (!detector || !landmarker) return

        let animationFrameId = 0
        let lastUpdateTime = 0
        // Use true value directly to avoid reference errors
        const adaptiveProcessing = true

        const frameProcessor = () => {
            const currentTime = performance.now()

            // Adaptive processing based on guidance state
            const isAligning = guidance.isDetected && (guidance.bothPupilsAligned || guidance.noseAligned)
            const isFullyAligned = guidance.bothPupilsAligned && guidance.noseAligned

            // Determine update interval dynamically
            let targetInterval = UPDATE_INTERVAL
            if (adaptiveProcessing) {
                // Increase frame rate when user is aligning their face
                if (isFullyAligned) {
                    targetInterval = 8 // ~120fps for perfect alignment
                } else if (isAligning) {
                    targetInterval = 12 // ~80fps when starting to align
                } else {
                    targetInterval = UPDATE_INTERVAL // Default rate when not aligned
                }
            }

            // Process frame with adaptive rate limiting
            if (currentTime - lastUpdateTime >= targetInterval) {
                // Sử dụng requestAnimationFrame để đồng bộ với chu kỳ vẽ của trình duyệt
                requestAnimationFrame(() => {
                    processFrame()
                })
                lastUpdateTime = currentTime
                skipFrameCount.current = 0
            } else {
                skipFrameCount.current++
            }

            animationFrameId = requestAnimationFrame(frameProcessor)
        }

        frameProcessor()

        return () => {
            cancelAnimationFrame(animationFrameId)
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
        }
    }, [detector, landmarker, processFrame])

    // Separate render loop for drawing on canvas at 60fps (ensures smooth ripples/animations)
    useEffect(() => {
        let animationFrameId = 0

        const renderLoop = () => {
            const canvas = canvasRef.current
            const video = webcamRef.current?.video
            if (canvas && video && video.readyState === video.HAVE_ENOUGH_DATA) {
                const ctx = canvas.getContext('2d')
                if (ctx) {
                    // Set canvas dimensions to match video dynamically
                    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                        canvas.width = video.videoWidth
                        canvas.height = video.videoHeight
                    }

                    // 1. Clear the canvas (transparent background, overlays the webcam video beneath)
                    ctx.clearRect(0, 0, canvas.width, canvas.height)

                    // Draw the faint 3x3 rule-of-thirds camera grid
                    draw3x3Grid(ctx, canvas.width, canvas.height)

                    // 2. Get the latest detection and landmarks cache
                    const currentDetection = previousDetectionsRef.current
                    const currentLandmarks = previousLandmarksRef.current

                    // 3. Draw overlays
                    if (currentDetection && currentLandmarks && currentLandmarks.length > 0) {
                        const eyesAligned = checkEyesAlignment(currentLandmarks)
                        const noseAligned = checkNoseAlignment(currentLandmarks)
                        const isAxesAligned = eyesAligned && noseAligned

                        FaceGuidanceOverlay({
                            ctx,
                            face: currentDetection,
                            landmarks: currentLandmarks,
                            width: canvas.width,
                            height: canvas.height,
                            isWithinGuide: true,
                            isCorrectDistance: true,
                            isAxesAligned,
                            facingMode
                        })
                    } else {
                        // If no face is detected yet, draw the default inactive axes
                        const idealCenterX = canvas.width / 2
                        const idealCenterY = canvas.height * 0.45
                        const idealWidth = canvas.width * (canvas.height > canvas.width ? 0.45 : 0.25)
                        const radiusX = idealWidth / 2
                        const radiusY = (idealWidth * 1.3) / 2

                        drawFixedGuidanceAxes(
                            ctx,
                            idealCenterX,
                            idealCenterY,
                            radiusX,
                            radiusY,
                            false,
                            [],
                            true,
                            false,
                            facingMode === 'user'
                        )
                    }
                }
            }
            animationFrameId = requestAnimationFrame(renderLoop)
        }

        renderLoop()

        return () => {
            cancelAnimationFrame(animationFrameId)
        }
    }, [facingMode])

    // Thêm useEffect mới để theo dõi sự thay đổi của trạng thái căn chỉnh
    // và hủy quá trình đếm ngược nếu mất alignment trong khi đang đếm
    useEffect(() => {
        // Chỉ kiểm tra khi đang trong quá trình đếm ngược
        if (isCapturing && captureProgress < 100) {
            // Nếu mất alignment của mắt hoặc mũi
            if (!guidance.bothPupilsAligned || !guidance.noseAligned) {
                console.log('=== CAMERA: PHÁT HIỆN MẤT ALIGNMENT TRONG QUÁ TRÌNH ĐẾM NGƯỢC - HỦY NGAY LẬP TỨC ===')
                // Hủy đếm ngược
                setCaptureProgress(0)
                setIsCapturing(false)
                setIsAutoCapturing(false)
                captureStartTimeRef.current = null

                if (captureAnimationRef.current) {
                    cancelAnimationFrame(captureAnimationRef.current)
                    captureAnimationRef.current = null
                }
            }
        }
    }, [guidance.bothPupilsAligned, guidance.noseAligned, isCapturing, captureProgress])

    // Thay đổi effect này để không tự động chụp, chỉ log thông báo
    useEffect(() => {
        if (shouldCapture && !autoCaptureDoneRef.current) {
            console.log('=== CAMERA: ĐÃ NHẬN LỆNH CHỤP, ĐANG CHỜ KHUÔN MẶT CHUẨN ===')
        }
    }, [shouldCapture])

    // Đảm bảo dọn dẹp animation khi component unmount
    useEffect(() => {
        return () => {
            if (captureAnimationRef.current) {
                cancelAnimationFrame(captureAnimationRef.current)
            }
        }
    }, [])

    // Render
    return (
        <div className='ai-face-webcam-container'>
            {isLoading && <LoadingAiFace />}

            {/* Processing/Saving overlay - Full screen with blur and prevents interaction */}
            {(isStartingCapture || isProcessingCapture || isSavingData) && (
                <div
                    className='fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center'
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: '100vw',
                        height: '100vh',
                        zIndex: 9999
                    }}
                >
                    <div className='bg-white/5 backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-white/20 max-w-md w-full mx-4'>
                        <div className='animate-spin rounded-full h-20 w-20 border-t-3 border-b-3 border-green-500 mx-auto mb-6'></div>
                        <p className='text-white text-center font-medium text-xl mb-3'>
                            {isStartingCapture && !isProcessingCapture
                                ? 'Đang chụp hình...'
                                : isProcessingCapture
                                    ? 'Đang xử lý khuôn mặt...'
                                    : 'Đang lưu thông tin...'}
                        </p>
                        <p className='text-white/70 text-center text-sm'>
                            {isStartingCapture && !isProcessingCapture
                                ? 'Vui lòng giữ nguyên tư thế...'
                                : isProcessingCapture
                                    ? 'Hình ảnh đang được phân tích và xử lý...'
                                    : 'Đang lưu thông tin vào hệ thống, vui lòng đợi trong giây lát...'}
                        </p>
                    </div>
                </div>
            )}

            <div
                className={`w-full mx-auto h-[100dvh] flex flex-row items-center justify-between gap-5 overflow-hidden ai-face-webcam-content ${isLoading ? 'invisible' : 'visible'
                    }`}
                style={{
                    display: isStartingCapture || isProcessingCapture || isSavingData ? 'none' : 'flex'
                }}
            >
                {/* Left Panel - Photo Guide */}
                <div className='flex-1 h-[100dvh] overflow-hidden px-4 hidden md:block'>
                    <PhotoGuidePanel />
                </div>

                {/* Center - Webcam */}
                <div
                    className='relative overflow-hidden border-0 md:border md:border-cyan-100 shadow-none md:shadow-xl mx-auto flex flex-col h-[100dvh] md:h-auto w-full md:w-auto bg-[#080c14] md:bg-transparent'
                    style={{ display: isStartingCapture || isProcessingCapture || isSavingData ? 'none' : 'block' }}
                    onDoubleClick={() => {
                        // Only trigger if not already capturing and face is detected
                        if (!isCapturing && !isProcessingCapture && !autoCaptureDoneRef.current) {
                            console.log('=== CAMERA MODAL: DOUBLE CLICK - BẮT ĐẦU CHỤP HÌNH ===')
                            // Cancel any ongoing auto-capture to avoid conflict
                            if (captureAnimationRef.current) {
                                cancelAnimationFrame(captureAnimationRef.current)
                                captureAnimationRef.current = null
                            }
                            setIsCapturing(false)
                            setIsAutoCapturing(false)
                            // Then initiate capture
                            setTimeout(() => captureImage(), 100)
                        }
                    }}
                >
                    <div className='webcam-wrapper'>
                        <Webcam
                            ref={webcamRef}
                            screenshotFormat='image/jpeg'
                            videoConstraints={videoConstraints}
                            className='webcam-view'
                            style={{
                                transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
                            }}
                            screenshotQuality={1}
                            forceScreenshotSourceSize={true}
                            onUserMedia={handleCameraReady}
                        />
                        <canvas
                            ref={canvasRef}
                            className='webcam-view'
                        />

                        {/* Floating overlay Back button - Desktop/Tablet Only */}
                        <button
                            onClick={() => navigate(-1)}
                            className='absolute top-4 left-4 z-50 w-10 h-10 rounded-full bg-black/45 backdrop-blur-sm border border-white/20 hidden md:flex items-center justify-center text-white active:scale-95 transition-all shadow-lg'
                            title='Quay lại'
                        >
                            <ArrowLeft className='w-5 h-5' strokeWidth={2.5} />
                        </button>

                        {/* Floating overlay Switch camera button - Desktop/Tablet Only */}
                        <button
                            onClick={toggleCamera}
                            className='absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/45 backdrop-blur-sm border border-white/20 hidden md:flex items-center justify-center text-white active:scale-95 transition-all shadow-lg'
                            title='Đổi camera'
                        >
                            <RefreshCw className='w-5 h-5' strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Countdown animation when capturing - Enhanced Style */}
                    {isCapturing && captureProgress < 100 && (
                        <div
                            className='absolute inset-0 flex items-center justify-center z-40'
                            style={{
                                animation: 'captureEnter 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                                background: 'radial-gradient(circle, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)'
                            }}
                        >
                            {/* Ripple effect background */}
                            <div className='absolute inset-0 flex items-center justify-center'>
                                <div
                                    className='absolute w-32 h-32 rounded-full border-2 border-green-400/20'
                                    style={{
                                        animation: 'ripple 2s infinite ease-out',
                                        animationDelay: '0s'
                                    }}
                                ></div>
                                <div
                                    className='absolute w-48 h-48 rounded-full border border-green-400/10'
                                    style={{
                                        animation: 'ripple 2s infinite ease-out',
                                        animationDelay: '0.5s'
                                    }}
                                ></div>
                                <div
                                    className='absolute w-64 h-64 rounded-full border border-green-400/5'
                                    style={{
                                        animation: 'ripple 2s infinite ease-out',
                                        animationDelay: '1s'
                                    }}
                                ></div>
                            </div>

                            <div className='relative'>
                                {/* Outer glow ring */}
                                <div
                                    className='absolute inset-0 w-32 h-32 rounded-full'
                                    style={{
                                        background: 'conic-gradient(from 0deg, #10b981, #34d399, #6ee7b7, #10b981)',
                                        animation: 'spin 3s linear infinite',
                                        filter: 'blur(8px)',
                                        opacity: 0.6
                                    }}
                                ></div>

                                {/* Main progress container */}
                                <div className='relative w-28 h-28 flex items-center justify-center'>
                                    {/* Background circle with gradient */}
                                    <svg
                                        className='w-28 h-28 absolute'
                                        viewBox='0 0 120 120'
                                        style={{
                                            filter: 'drop-shadow(0px 0px 10px rgba(139, 92, 246, 0.4))', // Drop shadow tím nhạt (Purple-500)
                                            transform: `scale(${1 + Math.sin(Date.now() / 200) * 0.05})`,
                                            transition: 'transform 0.2s ease-out'
                                        }}
                                    >
                                        {/* Gradient definitions */}
                                        <defs>
                                            <linearGradient id='progressGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
                                                <stop offset='0%' stopColor='#3B82F6' />
                                                <stop offset='50%' stopColor='#8B5CF6' />
                                                <stop offset='100%' stopColor='#D8B4FE' />
                                            </linearGradient>
                                            <filter id='glow'>
                                                <feGaussianBlur stdDeviation='4' result='coloredBlur' />
                                                <feMerge>
                                                    <feMergeNode in='coloredBlur' />
                                                    <feMergeNode in='SourceGraphic' />
                                                </feMerge>
                                            </filter>
                                        </defs>

                                        {/* Background track */}
                                        <circle
                                            cx='60'
                                            cy='60'
                                            r='50'
                                            fill='none'
                                            strokeWidth='3'
                                            stroke='rgba(203, 213, 225, 0.15)'
                                        />

                                        {/* Progress circle with gradient */}
                                        <circle
                                            cx='60'
                                            cy='60'
                                            r='50'
                                            fill='none'
                                            strokeWidth='5'
                                            stroke='url(#progressGradient)'
                                            strokeLinecap='round'
                                            strokeDasharray={`${2 * Math.PI * 50}`}
                                            strokeDashoffset={`${2 * Math.PI * 50 * (1 - captureProgress / 100)}`}
                                            transform='rotate(-90 60 60)'
                                            filter='url(#glow)'
                                            style={{
                                                transition: 'stroke-dashoffset 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
                                                willChange: 'stroke-dashoffset'
                                            }}
                                        />

                                        {/* Inner decorative circle */}
                                        <circle
                                            cx='60'
                                            cy='60'
                                            r='35'
                                            fill='rgba(59, 130, 246, 0.1)'
                                            strokeWidth='1'
                                            style={{
                                                animation: 'pulse 1.5s ease-in-out infinite alternate'
                                            }}
                                        />
                                    </svg>
                                    {/* Center content */}
                                    <div className='absolute inset-0 flex flex-col items-center justify-center'>
                                        {/* Camera icon */}
                                        <div
                                            className='mb-1'
                                            style={{
                                                animation: 'bounce 0.6s ease-in-out infinite alternate'
                                            }}
                                        >
                                            <svg
                                                width='24'
                                                height='24'
                                                viewBox='0 0 24 24'
                                                fill='none'
                                                xmlns='http://www.w3.org/2000/svg'
                                            >
                                                <path
                                                    d='M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z'
                                                    stroke='white'
                                                    strokeWidth='1.5'
                                                    fill='rgba(255,255,255,0.8)'
                                                />
                                                <path
                                                    d='M3 16.5V9C3 7.343 4.343 6 6 6H7.5L9 4H15L16.5 6H18C19.657 6 21 7.343 21 9V16.5C21 18.157 19.657 19.5 18 19.5H6C4.343 19.5 3 18.157 3 16.5Z'
                                                    stroke='white'
                                                    strokeWidth='1.5'
                                                    fill='none'
                                                />
                                            </svg>
                                        </div>

                                        {/* Progress text */}
                                        <div className='text-white font-bold text-xs tracking-wider'>
                                            {Math.round(captureProgress)}%
                                        </div>
                                    </div>
                                </div>

                                {/* Floating particles */}
                                <div className='absolute inset-0 pointer-events-none'>
                                    {[...Array(8)].map((_, i) => (
                                        <div
                                            key={i}
                                            className='absolute w-1 h-1 bg-green-400 rounded-full opacity-60'
                                            style={{
                                                left: `${50 + 40 * Math.cos((i * Math.PI) / 4)}%`,
                                                top: `${50 + 40 * Math.sin((i * Math.PI) / 4)}%`,
                                                animation: `particle${i} 2s ease-in-out infinite`,
                                                animationDelay: `${i * 0.2}s`
                                            }}
                                        ></div>
                                    ))}
                                </div>
                            </div>

                            {/* Bottom text */}
                            <div className='absolute bottom-20 left-1/2 transform -translate-x-1/2'>
                                <div className='text-white text-center capture-text'>
                                    <div className='text-lg font-semibold mb-1'>Đang chụp hình</div>
                                    <div className='text-sm text-green-300 opacity-80'>Giữ nguyên tư thế...</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mobile Only: Beautiful Wavy bottom dock with control buttons */}
                    <div className='absolute bottom-0 left-0 w-full bg-transparent flex flex-col items-center md:hidden select-none z-20 pb-0 pointer-events-none'>

                        {/* Wavy bottom background container */}
                        <div className='relative w-full bg-[#080c14] flex flex-col items-center pt-4 pb-14 pointer-events-auto'>
                            {/* Wavy SVG border at the top of the container */}
                            <div className='absolute top-0 left-0 w-full overflow-hidden leading-[0] transform translate-y-[-99%] pointer-events-none'>
                                <svg
                                    className='relative block w-full h-[28px]'
                                    viewBox='0 0 1200 120'
                                    preserveAspectRatio='none'
                                >
                                    <path
                                        d='M0,60 C150,100 350,20 500,60 C650,100 850,20 1000,60 C1100,80 1150,80 1200,60 L1200,120 L0,120 Z'
                                        fill='#080c14'
                                    />
                                </svg>
                            </div>

                            {/* Control row with back, capture, and switch camera buttons */}
                            <div className='flex items-center justify-between w-full max-w-[300px] px-2 z-10'>
                                {/* Left: Go Back Button */}
                                <button
                                    onClick={() => navigate(-1)}
                                    className='w-11 h-11 rounded-full bg-[#0a0f1d]/60 backdrop-blur-md border border-white/10 active:bg-white/20 flex items-center justify-center text-white active:scale-90 transition-all shadow-lg'
                                    title='Quay lại'
                                >
                                    <ArrowLeft className='w-5 h-5 text-white' strokeWidth={2.5} />
                                </button>

                                {/* Center: Capture button with outer glowing ring and purple shadow */}
                                <button
                                    onClick={captureImage}
                                    disabled={isStartingCapture || isProcessingCapture || isSavingData}
                                    className='relative w-18 h-18 rounded-full flex items-center justify-center active:scale-95 transition-all shadow-[0_0_25px_rgba(139,92,246,0.25),0_0_12px_rgba(255,255,255,0.15)] bg-white'
                                    title='Chụp ảnh'
                                >
                                    {/* Outer ring border */}
                                    <div className='absolute inset-0 rounded-full border-[4px] border-white opacity-95 shadow-[0_0_12px_rgba(255,255,255,0.4)]'></div>
                                    {/* Inner solid white circle */}
                                    <div className='w-12 h-12 rounded-full bg-white shadow-[inset_0_0_6px_rgba(0,0,0,0.15)]'></div>
                                </button>

                                {/* Right: Switch Camera Button */}
                                <button
                                    onClick={toggleCamera}
                                    className='w-11 h-11 rounded-full bg-[#0a0f1d]/60 backdrop-blur-md border border-white/10 active:bg-white/20 flex items-center justify-center text-white active:scale-90 transition-all shadow-lg'
                                    title='Đổi camera'
                                >
                                    <RefreshCw className='w-5 h-5 text-white' strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Panel - Process Panel */}
                <div className='flex-1 h-[100dvh] overflow-hidden px-4 hidden md:block'>
                    <ProcessPanel activeStep={1} />
                </div>
            </div>

            {/* FacePreview for automatic processing */}
            {previewImageSrc.length > 0 && (
                <FacePreview
                    previewImageSrc={previewImageSrc}
                    autoProcess={true}
                    onSaveStateChange={(saving, isComplete) => {
                        setIsSavingData(saving)
                        // Chỉ reset isStartingCapture và isProcessingCapture khi hoàn tất
                        if (!saving && isComplete !== undefined) {
                            // Nếu đã hoàn tất (thành công hoặc lỗi), reset tất cả trạng thái
                            setIsStartingCapture(false)
                            setIsProcessingCapture(false)
                            if (isComplete) {
                                console.log('=== LƯU THÀNH CÔNG, ĐÃ RESET TẤT CẢ TRẠNG THÁI ===')
                            } else {
                                console.log('=== LƯU THẤT BẠI, ĐÃ RESET TẤT CẢ TRẠNG THÁI ===')
                            }
                        }
                    }}
                />
            )}
        </div>
    )
}

function isFaceWithinCorners(boundingBox: BoundingBox, width: number, height: number): boolean {
    // Xác định chính xác biên của khung theo vị trí của 4 góc SVG
    const leftBoundary = 20 // Chính xác vị trí góc trái theo SVG
    const rightBoundary = width - 20 // Chính xác vị trí góc phải theo SVG
    const topBoundary = 30 // Chính xác vị trí góc trên theo SVG
    const bottomBoundary = height - 5 // Chính xác vị trí góc dưới theo SVG

    // Mở rộng biên thêm 1-2px để phát hiện chính xác hơn khi ra khỏi khung
    const boundaryTolerance = -2 // Giảm 2px để phát hiện nhạy hơn (giá trị âm để thắt chặt biên)
    const safeLeftBoundary = leftBoundary - boundaryTolerance
    const safeRightBoundary = rightBoundary + boundaryTolerance
    const safeTopBoundary = topBoundary - boundaryTolerance
    const safeBottomBoundary = bottomBoundary + boundaryTolerance

    // Lấy biên của khuôn mặt
    const faceLeft = boundingBox.originX
    const faceRight = boundingBox.originX + boundingBox.width
    const faceTop = boundingBox.originY
    const faceBottom = boundingBox.originY + boundingBox.height

    // Kiểm tra chính xác - khuôn mặt phải nằm hoàn toàn trong vùng được định nghĩa bởi các góc
    const isWithin =
        faceLeft >= safeLeftBoundary &&
        faceRight <= safeRightBoundary &&
        faceTop >= safeTopBoundary &&
        faceBottom <= safeBottomBoundary

    // Kiểm tra căn giữa với độ lệch chấp nhận được
    const faceCenterX = faceLeft + boundingBox.width / 2
    const centerX = width / 2
    const maxCenterDeviation = width * 0.08 // Giảm từ 10% xuống 8% độ lệch tối đa

    const isCentered = Math.abs(faceCenterX - centerX) <= maxCenterDeviation

    // Thắt chặt điều kiện kích thước
    const availableWidth = safeRightBoundary - safeLeftBoundary
    const maxAllowedFaceWidth = availableWidth * 0.9 // Giảm từ 95% xuống 90%
    const isFaceProperSize = boundingBox.width <= maxAllowedFaceWidth

    // Khuôn mặt phải vượt qua TẤT CẢ các kiểm tra để được coi là đúng vị trí
    return isWithin && isCentered && isFaceProperSize
}

// Hàm mới kiểm tra vị trí khuôn mặt dựa trên các điểm viền khuôn mặt
function isFaceWithinBoundaryByLandmarks(
    landmarks: NormalizedLandmark[],
    width: number,
    height: number,
    flipX: (x: number) => number
): boolean {
    if (landmarks.length < 478) return false

    // Mở rộng số lượng điểm quan trọng để phát hiện chính xác hơn
    const boundaryPoints = [
        // Cằm - điểm thấp nhất
        152,
        // Điểm dưới cằm
        175,
        // Điểm cao nhất trán
        10,
        // Điểm trán trái
        251,
        // Điểm trán phải
        21,
        // Đường viền bên trái
        127,
        234,
        93,
        132,
        58,
        172,
        // Đường viền bên phải
        356,
        454,
        323,
        361,
        288,
        397,
        // Tóc mái
        67,
        109,
        // Tai phải
        227,
        137,
        // Tai trái
        447,
        366,
        // Thêm điểm quan trọng cho viền khuôn mặt chi tiết hơn
        162,
        21,
        54,
        103,
        67,
        109, // Thêm điểm cho trán
        336,
        296,
        334,
        293,
        300, // Thêm điểm cho lông mày phải
        107,
        55,
        193,
        66,
        105,
        63,
        70, // Thêm điểm cho lông mày trái
        33,
        246,
        161,
        160,
        159,
        158,
        157,
        173, // Mắt trái chi tiết
        398,
        384,
        385,
        386,
        387,
        388,
        466,
        263, // Mắt phải chi tiết
        6,
        351,
        411,
        437,
        148,
        176,
        149,
        150,
        136,
        172,
        58,
        215,
        132,
        93 // Điểm viền cằm chi tiết
    ]

    // Xác định chính xác giới hạn khu vực dựa trên vị trí các góc SVG thực tế
    const boundaryLeft = 20 // Vị trí chính xác của góc trái
    const boundaryRight = width - 20 // Vị trí chính xác của góc phải
    const boundaryTop = 20 // Vị trí chính xác của góc trên
    const boundaryBottom = height - 50 // Vị trí chính xác của góc dưới

    // Nới lỏng biên 8px để người dùng dễ căn chỉnh trên thiết bị di động
    const boundaryTolerance = 8
    const checkedLeft = boundaryLeft - boundaryTolerance
    const checkedRight = boundaryRight + boundaryTolerance
    const checkedTop = boundaryTop - boundaryTolerance
    const checkedBottom = boundaryBottom + boundaryTolerance

    // Đếm số điểm nằm ngoài biên
    let pointsOutsideBoundary = 0

    // Cho phép tối đa 5 điểm nằm ngoài biên (tóc mái, tai...) để tránh khóa cứng camera
    const maxAllowedOutsidePoints = 5

    // Kiểm tra từng điểm viền khuôn mặt với biên chính xác
    for (const index of boundaryPoints) {
        if (!landmarks[index]) continue

        const x = flipX(landmarks[index].x * width)
        const y = landmarks[index].y * height

        // Nếu điểm nằm ngoài giới hạn, tăng bộ đếm
        if (x < checkedLeft || x > checkedRight || y < checkedTop || y > checkedBottom) {
            pointsOutsideBoundary++

            // Nếu quá số điểm cho phép nằm ngoài, kết thúc ngay
            if (pointsOutsideBoundary > maxAllowedOutsidePoints) {
                return false
            }
        }
    }

    // Nếu số điểm nằm ngoài vẫn trong ngưỡng cho phép
    return pointsOutsideBoundary <= maxAllowedOutsidePoints
}

// Cập nhật hàm isWithinOvalGuide để sử dụng phương pháp kiểm tra mới
function isWithinOvalGuide(
    boundingBox: BoundingBox,
    centerX: number,
    centerY: number,
    _radiusX: number,
    _radiusY: number,
    landmarks: NormalizedLandmark[],
    width: number,
    height: number,
    flipX: (x: number) => number = (x) => x
): boolean {
    // Nếu có đủ landmarks, sử dụng phương pháp kiểm tra mới
    if (landmarks.length >= 478 && width > 0 && height > 0) {
        return isFaceWithinBoundaryByLandmarks(landmarks, width, height, flipX)
    }

    // Fallback: sử dụng phương pháp cũ nếu không có đủ dữ liệu landmarks
    return isFaceWithinCorners(boundingBox, centerX * 2, centerY * 2)
}

// Cập nhật hàm isFaceCompletelyWithinOuterOval để sử dụng phương pháp kiểm tra mới
function isFaceCompletelyWithinOuterOval(
    boundingBox: BoundingBox,
    centerX: number,
    centerY: number,
    _radiusX: number,
    _radiusY: number,
    landmarks: NormalizedLandmark[],
    width: number,
    height: number,
    flipX: (x: number) => number = (x) => x
): boolean {
    // Nếu có đủ landmarks, sử dụng phương pháp kiểm tra mới
    if (landmarks.length >= 478 && width > 0 && height > 0) {
        return isFaceWithinBoundaryByLandmarks(landmarks, width, height, flipX)
    }

    // Fallback: sử dụng phương pháp cũ nếu không có đủ dữ liệu landmarks
    return isFaceWithinCorners(boundingBox, centerX * 2, centerY * 2)
}

function checkEyesAlignment(landmarks: NormalizedLandmark[]): boolean {
    if (landmarks.length < 475) return false

    // Sử dụng khóe mắt trong thay vì con ngươi để có độ ổn định cao hơn
    const leftInnerCorner = landmarks[133] // Khóe mắt trái trong
    const rightInnerCorner = landmarks[362] // Khóe mắt phải trong

    // Kiểm tra cả hai khóe mắt trong phải được phát hiện đúng (có tọa độ và nằm trong khoảng hợp lệ)
    if (
        !leftInnerCorner ||
        !rightInnerCorner ||
        leftInnerCorner.x === 0 ||
        leftInnerCorner.y === 0 ||
        rightInnerCorner.x === 0 ||
        rightInnerCorner.y === 0
    ) {
        return false
    }

    // Kiểm tra chênh lệch chiều cao giữa hai khóe mắt trong - khóe mắt ổn định hơn con ngươi
    const innerCornerYDifference = Math.abs(leftInnerCorner.y - rightInnerCorner.y)

    // Dung sai cho khóe mắt trong có thể chặt hơn vì chúng ổn định hơn con ngươi
    return innerCornerYDifference <= 0.004
}

function checkNoseAlignment(landmarks: NormalizedLandmark[]): boolean {
    if (landmarks.length < 175) return false

    const noseBridge = landmarks[168]
    const noseTip = landmarks[1]

    // Kiểm tra cả hai điểm trên mũi phải được phát hiện đúng
    if (!noseBridge || !noseTip || noseBridge.x === 0 || noseBridge.y === 0 || noseTip.x === 0 || noseTip.y === 0) {
        return false
    }

    // Giảm dung sai từ 0.03 xuống 0.02 để yêu cầu sống mũi thẳng hơn
    const noseDeviation = Math.abs(noseTip.x - noseBridge.x)
    return noseDeviation < 0.015
}

function checkFaceCentered(landmarks: NormalizedLandmark[]): boolean {
    if (landmarks.length < 460) return false

    const leftFaceEdge = landmarks[234]
    const rightFaceEdge = landmarks[454]

    // Kiểm tra cả hai điểm biên của khuôn mặt phải được phát hiện đúng
    if (
        !leftFaceEdge ||
        !rightFaceEdge ||
        leftFaceEdge.x === 0 ||
        leftFaceEdge.y === 0 ||
        rightFaceEdge.x === 0 ||
        rightFaceEdge.y === 0
    ) {
        return false
    }

    const faceCenterX = (leftFaceEdge.x + rightFaceEdge.x) / 2
    // Giảm dung sai từ 0.05 xuống 0.03 để yêu cầu mặt căn giữa chính xác hơn
    const centerDeviation = Math.abs(faceCenterX - 0.5)
    return centerDeviation < 0.015
}

function checkFixedAxesAlignment(
    landmarks: NormalizedLandmark[],
    centerX: number,
    centerY: number,
    radiusY: number,
    canvasWidth: number,
    canvasHeight: number,
    isMirrored: boolean
): { bothPupilsAligned: boolean; noseAligned: boolean } {
    if (landmarks.length < 474) {
        return { bothPupilsAligned: false, noseAligned: false }
    }

    const eyeLevel = centerY - radiusY * 0.3 - 15

    const leftInnerCorner = landmarks[133] // Khóe mắt trái trong
    const rightInnerCorner = landmarks[362] // Khóe mắt phải trong
    const noseTop = landmarks[168]
    const noseTip = landmarks[1]

    if (!leftInnerCorner || !rightInnerCorner || !noseTop || !noseTip) {
        return { bothPupilsAligned: false, noseAligned: false }
    }

    const leftInnerCornerY = leftInnerCorner.y * canvasHeight
    const rightInnerCornerY = rightInnerCorner.y * canvasHeight
    const noseTopX = isMirrored ? (1 - noseTop.x) * canvasWidth : noseTop.x * canvasWidth
    const noseTipX = isMirrored ? (1 - noseTip.x) * canvasWidth : noseTip.x * canvasWidth

    const activeAlignmentTolerance = 8

    const leftDeviationPrecise = Math.abs(leftInnerCornerY - eyeLevel)
    const rightDeviationPrecise = Math.abs(rightInnerCornerY - eyeLevel)

    const noseDeviation = Math.abs(noseTopX - centerX) + Math.abs(noseTipX - centerX)
    const maxNoseDeviation = 12

    const leftOnAxis = leftDeviationPrecise <= activeAlignmentTolerance
    const rightOnAxis = rightDeviationPrecise <= activeAlignmentTolerance
    const bothPupilsAligned = leftOnAxis && rightOnAxis
    const noseAligned = noseDeviation <= maxNoseDeviation

    return { bothPupilsAligned, noseAligned }
}

// Helper function to draw concentric radiating waves (ripples) around a point
function drawRipple(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    baseRadius: number,
    rgbaColorPrefix: string // e.g. "rgba(0, 255, 65" or "rgba(239, 68, 68"
) {
    const time = performance.now() / 1000 // Time in seconds
    const numRipples = 3 // 3 ripples instead of 2 for a more dense spreading wave

    ctx.save()
    for (let i = 0; i < numRipples; i++) {
        const duration = 1.8 // Slightly longer cycle for a smoother expand
        const phase = (time + i * (duration / numRipples)) % duration
        const progress = phase / duration // 0 to 1

        // Radiates up to 2.2x base radius (down from larger scales to keep it elegant)
        const rippleRadius = baseRadius + progress * baseRadius * 2.2
        const opacity = 0.5 * (1 - progress) // Fade out as it expands

        ctx.beginPath()
        ctx.strokeStyle = `${rgbaColorPrefix}, ${opacity})`
        ctx.lineWidth = 1.5 - progress * 0.5 // Wave line gets thinner as it spreads
        ctx.arc(x, y, rippleRadius, 0, Math.PI * 2)
        ctx.stroke()
    }
    ctx.restore()
}

// Helper function to draw a faint camera grid overlay (now dense 1x1 square style)
function draw3x3Grid(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)' // Subtle semi-transparent white
    ctx.lineWidth = 1.0 // Ultra-thin line for a highly technical, sleek graph paper look
    ctx.setLineDash([2, 3]) // Tiny, tightly-spaced dashes for an elegant camera sensor feel

    // Define uniform cell size for a perfect 1:1 aspect ratio (square 1x1 grid)
    // 36 divisions across the width gives very fine graph paper squares (approx. 10px on mobile viewports)
    const cellSize = width / 36

    // Vertical grid lines
    ctx.beginPath()
    for (let x = cellSize; x < width; x += cellSize) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
    }
    ctx.stroke()

    // Horizontal grid lines
    ctx.beginPath()
    for (let y = cellSize; y < height; y += cellSize) {
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
    }
    ctx.stroke()

    ctx.restore()
}

// 1. drawFixedGuidanceAxes: chỉnh màu trục X/Y và các điểm căn chỉnh
function drawFixedGuidanceAxes(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radiusX: number,
    radiusY: number,
    _isAligned: boolean,
    landmarks: NormalizedLandmark[] = [],
    isCorrectDistance: boolean = true, // Change default to true
    isWithinGuide: boolean = true, // Add parameter to control point visibility
    isMirrored: boolean = true
): { bothPupilsAligned: boolean; noseAligned: boolean } {
    ctx.save()

    // Vị trí trục X ngang tầm mắt
    const eyeLevel = centerY - radiusY * 0.3 - 15

    let bothPupilsAligned = false
    let noseAligned = false
    let leftOnAxis = false
    let rightOnAxis = false

    if (landmarks.length >= 474) {
        // Sử dụng khóe mắt trong thay vì con ngươi
        const leftInnerCorner = landmarks[133] // Khóe mắt trái trong
        const rightInnerCorner = landmarks[362] // Khóe mắt phải trong
        const noseTop = landmarks[168]
        const noseTip = landmarks[1]

        const leftInnerCornerY = leftInnerCorner.y * ctx.canvas.height
        const rightInnerCornerY = rightInnerCorner.y * ctx.canvas.height
        const noseTopX = isMirrored ? (1 - noseTop.x) * ctx.canvas.width : noseTop.x * ctx.canvas.width
        const noseTipX = isMirrored ? (1 - noseTip.x) * ctx.canvas.width : noseTip.x * ctx.canvas.width

        // Nới lỏng dung sai trục X lên 8px để chống rung tay trên iPad/di động
        const activeAlignmentTolerance = 8

        const leftDeviationPrecise = Math.abs(leftInnerCornerY - eyeLevel)
        const rightDeviationPrecise = Math.abs(rightInnerCornerY - eyeLevel)

        const noseDeviation = Math.abs(noseTopX - centerX) + Math.abs(noseTipX - centerX)
        // Nới lỏng dung sai trục Y lên 12px để căn chỉnh dễ dàng hơn khi cầm tay
        const maxNoseDeviation = 12

        leftOnAxis = leftDeviationPrecise <= activeAlignmentTolerance
        rightOnAxis = rightDeviationPrecise <= activeAlignmentTolerance
        bothPupilsAligned = leftOnAxis && rightOnAxis
        noseAligned = noseDeviation <= maxNoseDeviation
    }

    // Check if both the alignment conditions AND the distance condition are met
    const shouldActivatePupils = bothPupilsAligned && isCorrectDistance
    const shouldActivateNose = noseAligned && isCorrectDistance

    // Always draw the vertical axis (Y) regardless of alignment
    ctx.beginPath()
    if (shouldActivateNose) {
        ctx.strokeStyle = COLORS.ACTIVE.NOSE_AXIS
        ctx.lineWidth = STYLE.ACTIVE.LINE_WIDTH
        ctx.shadowColor = COLORS.SHADOW.NOSE_AXIS
        ctx.shadowBlur = STYLE.ACTIVE.SHADOW_BLUR
        ctx.setLineDash([])
    } else {
        ctx.strokeStyle = COLORS.INACTIVE.AXIS
        ctx.lineWidth = STYLE.INACTIVE.LINE_WIDTH
        ctx.shadowBlur = STYLE.INACTIVE.SHADOW_BLUR
        ctx.setLineDash(STYLE.INACTIVE.LINE_DASH)
    }

    ctx.moveTo(centerX, eyeLevel - radiusY * 0.7)
    ctx.lineTo(centerX, centerY + radiusY * 1.2)
    ctx.stroke()
    ctx.setLineDash([])

    // Chỉ vẽ điểm mũi khi khuôn mặt đã nằm trong khung
    if (landmarks.length >= 474 && isWithinGuide) {
        const noseTip = landmarks[1]
        const noseTipX = isMirrored ? (1 - noseTip.x) * ctx.canvas.width : noseTip.x * ctx.canvas.width
        const noseTipY = noseTip.y * ctx.canvas.height

        if (shouldActivateNose) {
            // Draw animated radiating ripple
            drawRipple(ctx, noseTipX, noseTipY, STYLE.ACTIVE.POINT_SIZE * 1.3, 'rgba(0, 255, 65')

            ctx.beginPath()
            ctx.shadowColor = COLORS.SHADOW.NOSE_AXIS
            ctx.shadowBlur = STYLE.ACTIVE.SHADOW_BLUR
            ctx.fillStyle = COLORS.ACTIVE.NOSE_POINT
            ctx.arc(noseTipX, noseTipY, STYLE.ACTIVE.POINT_SIZE, 0, Math.PI * 2)
            ctx.fill()

            ctx.beginPath()
            ctx.fillStyle = COLORS.CENTER_POINT
            ctx.arc(noseTipX, noseTipY, STYLE.ACTIVE.CENTER_POINT_SIZE, 0, Math.PI * 2)
            ctx.fill()
        } else {
            // Draw animated radiating ripple
            drawRipple(ctx, noseTipX, noseTipY, STYLE.ACTIVE.POINT_SIZE * 1.3, 'rgba(239, 68, 68')

            ctx.beginPath()
            ctx.shadowBlur = STYLE.INACTIVE.SHADOW_BLUR
            ctx.fillStyle = '#ef4444' // Red color for nose point in inactive state
            ctx.arc(noseTipX, noseTipY, STYLE.INACTIVE.POINT_SIZE, 0, Math.PI * 2)
            ctx.fill()
        }
    }

    // Always draw the horizontal eye zone (X axis)
    if (shouldActivatePupils) {
        ctx.strokeStyle = COLORS.ACTIVE.EYE_AXIS
        ctx.lineWidth = STYLE.ACTIVE.LINE_WIDTH
        ctx.shadowColor = COLORS.SHADOW.EYE_AXIS
        ctx.shadowBlur = STYLE.ACTIVE.SHADOW_BLUR
    } else {
        ctx.strokeStyle = COLORS.INACTIVE.AXIS
        ctx.lineWidth = STYLE.INACTIVE.LINE_WIDTH
        ctx.shadowBlur = STYLE.INACTIVE.SHADOW_BLUR
        ctx.setLineDash(STYLE.INACTIVE.LINE_DASH)
    }

    ctx.beginPath()
    ctx.moveTo(centerX - radiusX * 1.2, eyeLevel)
    ctx.lineTo(centerX + radiusX * 1.2, eyeLevel)
    ctx.stroke()
    ctx.setLineDash([])

    // Chỉ vẽ điểm khóe mắt khi khuôn mặt đã nằm trong khung
    if (landmarks.length >= 474 && isWithinGuide) {
        const leftInnerCorner = landmarks[133] // Khóe mắt trái trong
        const rightInnerCorner = landmarks[362] // Khóe mắt phải trong
        const noseTip = landmarks[1]
        const leftInnerCornerX = isMirrored ? (1 - leftInnerCorner.x) * ctx.canvas.width : leftInnerCorner.x * ctx.canvas.width
        const leftInnerCornerY = leftInnerCorner.y * ctx.canvas.height
        const rightInnerCornerX = isMirrored ? (1 - rightInnerCorner.x) * ctx.canvas.width : rightInnerCorner.x * ctx.canvas.width
        const rightInnerCornerY = rightInnerCorner.y * ctx.canvas.height
        const noseTipX = isMirrored ? (1 - noseTip.x) * ctx.canvas.width : noseTip.x * ctx.canvas.width
        const noseTipY = noseTip.y * ctx.canvas.height

        // Draw connecting lines between the 3 points when all are active (aligned)
        if (shouldActivatePupils && shouldActivateNose) {
            ctx.beginPath()
            ctx.strokeStyle = '#00FF41' // Glowing green for perfect connection
            ctx.lineWidth = 5.5 // Prominent connection line (was 2.5, up from 4.5)
            ctx.shadowColor = 'rgba(0, 255, 65, 0.6)'
            ctx.shadowBlur = 12 // Glowing blur (up from 8)
            ctx.lineJoin = 'round'

            ctx.moveTo(leftInnerCornerX, leftInnerCornerY)
            ctx.lineTo(rightInnerCornerX, rightInnerCornerY)
            ctx.lineTo(noseTipX, noseTipY)
            ctx.closePath()
            ctx.stroke()
            ctx.shadowBlur = 0 // Reset shadow
        }

        if (shouldActivatePupils) {
            ;[
                [leftInnerCornerX, leftInnerCornerY],
                [rightInnerCornerX, rightInnerCornerY]
            ].forEach(([x, y]) => {
                // Draw animated radiating ripple
                drawRipple(ctx, x, y, STYLE.ACTIVE.POINT_SIZE * 1.3, 'rgba(0, 255, 65')

                ctx.beginPath()
                ctx.shadowColor = COLORS.SHADOW.EYE_AXIS
                ctx.shadowBlur = STYLE.ACTIVE.SHADOW_BLUR
                ctx.fillStyle = COLORS.ACTIVE.EYE_POINT
                ctx.arc(x, y, STYLE.ACTIVE.POINT_SIZE, 0, Math.PI * 2)
                ctx.fill()

                ctx.beginPath()
                ctx.fillStyle = COLORS.CENTER_POINT
                ctx.arc(x, y, STYLE.ACTIVE.CENTER_POINT_SIZE, 0, Math.PI * 2)
                ctx.fill()
            })
        } else {
            ;[
                [leftInnerCornerX, leftInnerCornerY],
                [rightInnerCornerX, rightInnerCornerY]
            ].forEach(([x, y]) => {
                // Draw animated radiating ripple
                drawRipple(ctx, x, y, STYLE.ACTIVE.POINT_SIZE * 1.3, 'rgba(239, 68, 68')

                ctx.beginPath()
                ctx.shadowBlur = STYLE.INACTIVE.SHADOW_BLUR
                ctx.fillStyle = '#ef4444' // Red color for eye points in inactive state
                ctx.arc(x, y, STYLE.INACTIVE.POINT_SIZE, 0, Math.PI * 2)
                ctx.fill()
            })
        }
    } else if (!isWithinGuide) {
        // Khi khuôn mặt chưa nằm trong khung, vẫn vẽ trục nhưng không vẽ điểm
        ctx.beginPath()
        ctx.strokeStyle = COLORS.INACTIVE.AXIS
        ctx.lineWidth = STYLE.INACTIVE.LINE_WIDTH
        ctx.shadowBlur = STYLE.INACTIVE.SHADOW_BLUR
        ctx.setLineDash(STYLE.INACTIVE.LINE_DASH)
        ctx.moveTo(centerX - radiusX * 1.2, eyeLevel)
        ctx.lineTo(centerX + radiusX * 1.2, eyeLevel)
        ctx.stroke()

        // Draw Y axis
        ctx.beginPath()
        ctx.moveTo(centerX, eyeLevel - radiusY * 0.7)
        ctx.lineTo(centerX, centerY + radiusY * 1.2)
        ctx.stroke()
        ctx.setLineDash([])
    }

    // Draw neon directions arrows for high-precision guidance
    if (landmarks.length >= 474 && isWithinGuide) {
        ctx.save()
        ctx.lineWidth = 4.5 // Prominent arrow line width (was 3.0, up from 4.5)
        ctx.strokeStyle = '#ffffff' // White color for guidance arrows
        ctx.fillStyle = '#ffffff' // White color for guidance arrows
        ctx.shadowColor = 'rgba(255, 255, 255, 0.4)' // Soft white shadow
        ctx.shadowBlur = 10 // Prominent shadow blur (was 8, up from 10)

        // 1. Nose alignment guidance arrow (if off-center Y axis)
        if (!noseAligned) {
            const noseTip = landmarks[1]
            const noseTipX = isMirrored ? (1 - noseTip.x) * ctx.canvas.width : noseTip.x * ctx.canvas.width
            const noseTipY = noseTip.y * ctx.canvas.height
            const arrowLength = 40 // Large nose arrow length (was 30, up from 40)
            const gapOffset = 26 // Large gap from nose tip center (was 22, up from 25)

            if (noseTipX > centerX + 12) {
                // Nose is too far right (screen), draw arrow pointing LEFT towards center
                ctx.beginPath()
                ctx.moveTo(noseTipX - gapOffset, noseTipY)
                ctx.lineTo(noseTipX - gapOffset - arrowLength, noseTipY)
                ctx.stroke()

                ctx.beginPath()
                ctx.moveTo(noseTipX - gapOffset - arrowLength, noseTipY)
                ctx.lineTo(noseTipX - gapOffset - arrowLength + 14, noseTipY - 9) // Large head (was 11/7, up from 14/9)
                ctx.lineTo(noseTipX - gapOffset - arrowLength + 14, noseTipY + 9)
                ctx.closePath()
                ctx.fill()
            } else if (noseTipX < centerX - 12) {
                // Nose is too far left (screen), draw arrow pointing RIGHT towards center
                ctx.beginPath()
                ctx.moveTo(noseTipX + gapOffset, noseTipY)
                ctx.lineTo(noseTipX + gapOffset + arrowLength, noseTipY)
                ctx.stroke()

                ctx.beginPath()
                ctx.moveTo(noseTipX + gapOffset + arrowLength, noseTipY)
                ctx.lineTo(noseTipX + gapOffset + arrowLength - 14, noseTipY - 9) // Large head (was 11/7, up from 14/9)
                ctx.lineTo(noseTipX + gapOffset + arrowLength - 14, noseTipY + 9)
                ctx.closePath()
                ctx.fill()
            }
        }

        // 2. Eyes tilt/height alignment guidance arrow (if off-center X axis)
        if (!bothPupilsAligned) {
            const leftInnerCorner = landmarks[133]
            const rightInnerCorner = landmarks[362]
            const leftInnerCornerX = isMirrored ? (1 - leftInnerCorner.x) * ctx.canvas.width : leftInnerCorner.x * ctx.canvas.width
            const leftInnerCornerY = leftInnerCorner.y * ctx.canvas.height
            const rightInnerCornerX = isMirrored ? (1 - rightInnerCorner.x) * ctx.canvas.width : rightInnerCorner.x * ctx.canvas.width
            const rightInnerCornerY = rightInnerCorner.y * ctx.canvas.height
            const arrowLength = 26 // Large eye arrow length (was 20, up from 25)
            const offset = 28 // Large offset from eye center (was 24, up from 28)

            // Left eye adjustment
            if (leftInnerCornerY > eyeLevel + 8) {
                // Left eye is too low, point UP
                ctx.beginPath()
                ctx.moveTo(leftInnerCornerX, leftInnerCornerY + offset)
                ctx.lineTo(leftInnerCornerX, leftInnerCornerY + offset - arrowLength)
                ctx.stroke()

                ctx.beginPath()
                ctx.moveTo(leftInnerCornerX, leftInnerCornerY + offset - arrowLength)
                ctx.lineTo(leftInnerCornerX - 9, leftInnerCornerY + offset - arrowLength + 9) // Large head (was 7/7, up from 9/9)
                ctx.lineTo(leftInnerCornerX + 9, leftInnerCornerY + offset - arrowLength + 9)
                ctx.closePath()
                ctx.fill()
            } else if (leftInnerCornerY < eyeLevel - 8) {
                // Left eye is too high, point DOWN
                ctx.beginPath()
                ctx.moveTo(leftInnerCornerX, leftInnerCornerY - offset)
                ctx.lineTo(leftInnerCornerX, leftInnerCornerY - offset + arrowLength)
                ctx.stroke()

                ctx.beginPath()
                ctx.moveTo(leftInnerCornerX, leftInnerCornerY - offset + arrowLength)
                ctx.lineTo(leftInnerCornerX - 9, leftInnerCornerY - offset + arrowLength - 9) // Large head (was 7/7, up from 9/9)
                ctx.lineTo(leftInnerCornerX + 9, leftInnerCornerY - offset + arrowLength - 9)
                ctx.closePath()
                ctx.fill()
            }

            // Right eye adjustment
            if (rightInnerCornerY > eyeLevel + 8) {
                // Right eye is too low, point UP
                ctx.beginPath()
                ctx.moveTo(rightInnerCornerX, rightInnerCornerY + offset)
                ctx.lineTo(rightInnerCornerX, rightInnerCornerY + offset - arrowLength)
                ctx.stroke()

                ctx.beginPath()
                ctx.moveTo(rightInnerCornerX, rightInnerCornerY + offset - arrowLength)
                ctx.lineTo(rightInnerCornerX - 9, rightInnerCornerY + offset - arrowLength + 9) // Large head (was 7/7, up from 9/9)
                ctx.lineTo(rightInnerCornerX + 9, rightInnerCornerY + offset - arrowLength + 9)
                ctx.closePath()
                ctx.fill()
            } else if (rightInnerCornerY < eyeLevel - 8) {
                // Right eye is too high, point DOWN
                ctx.beginPath()
                ctx.moveTo(rightInnerCornerX, rightInnerCornerY - offset)
                ctx.lineTo(rightInnerCornerX, rightInnerCornerY - offset + arrowLength)
                ctx.stroke()

                ctx.beginPath()
                ctx.moveTo(rightInnerCornerX, rightInnerCornerY - offset + arrowLength)
                ctx.lineTo(rightInnerCornerX - 9, rightInnerCornerY - offset + arrowLength - 9) // Large head (was 7/7, up from 9/9)
                ctx.lineTo(rightInnerCornerX + 9, rightInnerCornerY - offset + arrowLength - 9)
                ctx.closePath()
                ctx.fill()
            }
        }
        ctx.restore()
    }

    ctx.restore()
    return { bothPupilsAligned, noseAligned }
}
// === KẾT THÚC CHỈNH MÀU STYLE ===

function isFaceAlignedWithFixedAxes(face: FaceAlignment, dimensions: ImageDimensions, isMirrored: boolean = true): boolean {
    if (!face || !dimensions) return false

    const { noseTip } = face

    // Note: Cần cập nhật interface FaceAlignment để sử dụng khóe mắt trong thay vì pupils
    // Tạm thời sử dụng logic cũ với pupil data, nhưng trong tương lai nên cập nhật interface
    const { leftPupil, rightPupil } = face

    // Convert normalized coordinates to pixel coordinates
    const leftEyeY = leftPupil.y * dimensions.height
    const rightEyeY = rightPupil.y * dimensions.height
    const noseTipX = isMirrored ? (1 - noseTip.x) * dimensions.width : noseTip.x * dimensions.width

    // Ideal eye level - Must match drawFixedGuidanceAxes
    const idealEyeLevel = face.centerY - face.radiusY * 0.3 - 15

    // Check if both eye corners are on the fixed eye level line
    const leftEyeDeviationFromIdeal = Math.abs(leftEyeY - idealEyeLevel)
    const rightEyeDeviationFromIdeal = Math.abs(rightEyeY - idealEyeLevel)
    const eyeLevelTolerance = 8

    const areBothEyeCornersOnFixedAxis =
        leftEyeDeviationFromIdeal <= eyeLevelTolerance && rightEyeDeviationFromIdeal <= eyeLevelTolerance

    // Check if nose is aligned with the center X axis
    const centerX = dimensions.width / 2
    const noseXDeviation = Math.abs(noseTipX - centerX)
    const noseTolerance = 12
    const isNoseAligned = noseXDeviation <= noseTolerance

    return areBothEyeCornersOnFixedAxis && isNoseAligned
}

function FaceGuidanceOverlay({
    ctx,
    face,
    landmarks,
    width,
    height,
    isWithinGuide: forcedWithinGuide,
    isAxesAligned = false,
    facingMode = 'user'
}: {
    ctx: CanvasRenderingContext2D
    face: any
    landmarks: NormalizedLandmark[]
    width: number
    height: number
    isWithinGuide?: boolean
    isCorrectDistance?: boolean
    isAxesAligned?: boolean
    isHorizontalAxisActive?: boolean
    isVerticalAxisActive?: boolean
    optimizeRendering?: boolean
    facingMode?: 'user' | 'environment'
}) {
    if (!face.boundingBox) return

    const flipX = (x: number) => width - x
    const idealFaceWidth = width * (height > width ? 0.45 : 0.25)
    const idealFaceHeight = idealFaceWidth * 1.3
    const radiusX = idealFaceWidth / 2
    const radiusY = idealFaceHeight / 2
    const ovalCenterX = width / 2
    const ovalCenterY = height * 0.45

    const flippedBoundingBox: BoundingBox = {
        ...face.boundingBox,
        originX: facingMode === 'user' ? flipX(face.boundingBox.originX + face.boundingBox.width) : face.boundingBox.originX
    }

    const isWithinGuide =
        forcedWithinGuide !== undefined
            ? forcedWithinGuide
            : isWithinOvalGuide(flippedBoundingBox, ovalCenterX, ovalCenterY, radiusX, radiusY, landmarks, width, height, facingMode === 'user' ? flipX : (x) => x)

    // ALWAYS draw fixed guidance axes regardless of face position or distance
    // Call drawFixedGuidanceAxes and get alignment status
    drawFixedGuidanceAxes(
        ctx,
        ovalCenterX,
        ovalCenterY,
        radiusX,
        radiusY,
        isAxesAligned,
        landmarks,
        true, // Always true at this point since we've passed the distance check
        isWithinGuide, // Pass isWithinGuide to control point visibility
        facingMode === 'user'
    )
}