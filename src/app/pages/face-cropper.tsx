import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision'
import { useEffect, useRef, useState } from 'react'
import ReactCrop, { Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

// Các hằng số tùy chỉnh cho việc cắt khuôn mặt
const CONSTANTS = {
    // Tỷ lệ mở rộng hai bên (trái và phải), giá trị càng lớn thì mở rộng càng nhiều
    PADDING_NGANG: 0.15, // Giảm từ 0.15 xuống 0.05 (5% mỗi bên)

    // Tỷ lệ mở rộng phía dưới, giá trị càng lớn thì phần dưới càng được mở rộng
    // Giá trị âm sẽ cắt bớt phần dưới cằm (không lấy cổ)
    PADDING_DUOI: -1.3, // Tăng độ cắt phần dưới để lấy cao hơn trên mặt

    // Tỷ lệ mở rộng phía trên, giá trị càng lớn thì phần trên càng được mở rộng
    PADDING_TREN: 0.25, // Giảm bớt để không lấy quá nhiều phần trên đầu

    // Độ dày của đường viền khung đỏ
    DO_DAY_VIEN: 3,

    // Màu của đường viền
    MAU_VIEN: 'red',

    // Có hiển thị ảnh gốc và khung đỏ hay không
    HIEN_THI_ANH_GOC: true, // Đặt thành true để hiển thị ảnh gốc có khung đỏ

    // Tỷ lệ khung hình mặc định (width / height)
    TY_LE_KHUNG: 1 // Tỷ lệ 1:1 (vuông)
}

// Hàm trợ giúp để tạo crop ban đầu
function createCropFromBoundingBox(
    boundingBox: {
        originX: number
        originY: number
        width: number
        height: number
    },
    imageWidth: number,
    imageHeight: number
): Crop {
    // Tính toán điểm trung tâm khuôn mặt
    const faceCenterX = boundingBox.originX + boundingBox.width / 2

    // Xác định điểm cắt dưới dựa trên PADDING_DUOI
    // Nếu PADDING_DUOI âm, chúng ta sẽ cắt lên trên từ điểm cuối của khuôn mặt
    // Giá trị âm cao hơn (-1) sẽ cắt cao hơn lên khuôn mặt
    const bottomY = boundingBox.originY + boundingBox.height

    // Tính toán vị trí Y mới dựa trên điều chỉnh PADDING_DUOI
    // Với PADDING_DUOI âm, điểm cắt dưới sẽ ở trên điểm dưới cùng của khuôn mặt
    // Giá trị -1 nghĩa là cắt hoàn toàn phần cằm
    const adjustedBottomY = bottomY + boundingBox.height * CONSTANTS.PADDING_DUOI

    // Tính toán phần cao mới của khuôn mặt sau khi điều chỉnh
    const facialAreaHeight = adjustedBottomY - boundingBox.originY

    // Tính toán padding ngang và trên
    const paddingX = boundingBox.width * CONSTANTS.PADDING_NGANG
    const paddingTop = boundingBox.height * CONSTANTS.PADDING_TREN

    // Chiều cao thực của vùng cắt bao gồm padding phía trên
    const croppedHeight = facialAreaHeight + paddingTop

    // Chiều rộng vùng cắt bao gồm padding hai bên
    const croppedWidth = boundingBox.width + paddingX * 2

    // Đảm bảo tỷ lệ khung hình theo yêu cầu (mặc định là 1:1)
    let finalWidth = croppedWidth
    let finalHeight = croppedHeight

    // Nếu cần tỷ lệ 1:1 (vuông)
    if (CONSTANTS.TY_LE_KHUNG === 1) {
        // Lấy kích thước lớn nhất để đảm bảo không cắt mất phần khuôn mặt
        const squareSize = Math.max(croppedWidth, croppedHeight)
        finalWidth = squareSize
        finalHeight = squareSize
    }

    // Tính toán điểm x, y bắt đầu để crop dựa trên phần tính toán ở trên
    // Đảm bảo khuôn mặt nằm ở giữa theo chiều ngang
    let x = faceCenterX - finalWidth / 2

    // Điểm y bắt đầu sẽ ở trên boundingBox.originY một khoảng paddingTop
    let y = boundingBox.originY - paddingTop

    // Đảm bảo không vượt quá kích thước ảnh
    x = Math.max(0, x)
    y = Math.max(0, y)

    // Điều chỉnh kích thước nếu vượt quá biên ảnh
    finalWidth = Math.min(finalWidth, imageWidth - x)
    finalHeight = Math.min(finalHeight, imageHeight - y)

    // Đảm bảo tỷ lệ 1:1 nếu cần
    if (CONSTANTS.TY_LE_KHUNG === 1) {
        const minSize = Math.min(finalWidth, finalHeight)
        finalWidth = minSize
        finalHeight = minSize
    }

    // Chuyển đổi thành phần trăm cho thư viện react-image-crop
    return {
        unit: '%',
        x: (x / imageWidth) * 100,
        y: (y / imageHeight) * 100,
        width: (finalWidth / imageWidth) * 100,
        height: (finalHeight / imageHeight) * 100
    }
}

// Thêm prop types cho component FaceCropper
interface FaceCropperProps {
    urlFromProps?: string // URL để xử lý có thể truyền từ bên ngoài vào
    onFaceCropReady?: (faceCrop: string) => void // Callback để gửi ảnh đã cắt ra ngoài
    showUI?: boolean // Có hiển thị UI không, mặc định là true
}

export default function FaceCropper({ urlFromProps, onFaceCropReady, showUI = true }: FaceCropperProps = {}) {
    // State cho phần xử lý ảnh và khuôn mặt
    const [imageSource, setImageSource] = useState<string | null>(null)
    const [faceCrop, setFaceCrop] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [crop, setCrop] = useState<Crop>()

    // State cho MediaPipe và detector
    const [detector, setDetector] = useState<FaceDetector | null>(null)
    const [detectorLoading, setDetectorLoading] = useState(true)
    const [detectorError, setDetectorError] = useState<string | null>(null)

    // Refs
    const imageRef = useRef<HTMLImageElement>(null)

    // Effect khi faceCrop thay đổi và có callback
    useEffect(() => {
        if (faceCrop && onFaceCropReady) {
            onFaceCropReady(faceCrop)
        }
    }, [faceCrop, onFaceCropReady])

    // Effect khi nhận được URL từ props
    useEffect(() => {
        if (urlFromProps && detector && !detectorLoading) {
            console.log('Nhận được URL từ props, bắt đầu xử lý tự động')
            processUrlDirect(urlFromProps)
        }
    }, [urlFromProps, detector, detectorLoading])

    useEffect(() => {
        let isMounted = true

        const initializeDetector = async () => {
            if (!isMounted) return

            setDetectorLoading(true)
            setDetectorError(null)

            try {
                console.log('Đang khởi tạo MediaPipe...')
                const vision = await FilesetResolver.forVisionTasks(
                    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
                )

                console.log('Tạo Face Detector...')
                const faceDetector = await FaceDetector.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath:
                            'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
                        delegate: 'CPU'
                    },
                    runningMode: 'IMAGE'
                })

                if (!isMounted) return

                console.log('Khởi tạo Face Detector thành công!')
                setDetector(faceDetector)
                setDetectorLoading(false)

                // Nếu có URL từ props, xử lý nó ngay sau khi detector sẵn sàng
                if (urlFromProps) {
                    processUrlDirect(urlFromProps)
                }
            } catch (error) {
                console.error('Lỗi khởi tạo detector:', error)
                if (isMounted) {
                    setDetectorError('Không thể khởi tạo bộ phát hiện khuôn mặt. Vui lòng tải lại trang.')
                    setDetectorLoading(false)
                }
            }
        }

        initializeDetector()

        return () => {
            isMounted = false
        }
    }, [])

    // Phương thức xử lý trực tiếp URL - Đã cải tiến để tự động hoàn toàn
    const processUrlDirect = (url: string) => {
        if (!url.trim()) {
            console.error('URL rỗng, không thể xử lý')
            return
        }

        if (detectorLoading) {
            console.error('Đang tải bộ phát hiện khuôn mặt')
            return
        }

        if (!detector) {
            console.error('Bộ phát hiện khuôn mặt chưa được khởi tạo')
            return
        }

        console.log('Bắt đầu xử lý ảnh từ URL:', url)
        setIsLoading(true)

        // Tải ảnh từ URL
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = url

        img.onload = () => {
            console.log('Ảnh đã tải từ URL')
            setImageSource(url)
            setCrop(undefined)
            detectFace(url)
        }

        img.onerror = () => {
            console.error('Lỗi tải ảnh từ URL')
            setIsLoading(false)
            // Thông báo lỗi thông qua callback nếu có
            if (onFaceCropReady) {
                onFaceCropReady('error')
            }
        }
    }

    const detectFace = async (imageUrl: string) => {
        if (!detector) {
            console.error('Detector chưa sẵn sàng')
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        try {
            console.log('Chuẩn bị tải ảnh...')
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.src = imageUrl

            img.onload = () => {
                try {
                    console.log('Ảnh đã tải, kích thước:', img.width, 'x', img.height)

                    console.log('Đang phát hiện khuôn mặt...')
                    // Detect faces
                    const detections = detector.detect(img)

                    console.log('Kết quả phát hiện:', detections)
                    if (detections.detections && detections.detections.length > 0) {
                        console.log(`Đã tìm thấy ${detections.detections.length} khuôn mặt`)
                        // Lấy thông tin khuôn mặt đầu tiên
                        const face = detections.detections[0]
                        const boundingBox = face.boundingBox

                        // Kiểm tra nếu không tìm thấy khung giới hạn
                        if (!boundingBox) {
                            console.log('Không tìm thấy hộp giới hạn hợp lệ')
                            setIsLoading(false)
                            return
                        }

                        console.log('Tọa độ khuôn mặt:', boundingBox)

                        // Tạo crop ban đầu từ bounding box
                        const initialCrop = createCropFromBoundingBox(boundingBox, img.width, img.height)

                        // Đặt crop state ban đầu để hiển thị trong ReactCrop
                        setCrop(initialCrop)

                        // Tạo crop mặc định - Xử lý tự động không cần đợi người dùng
                        generateCroppedImage(imageUrl, initialCrop)
                    } else {
                        console.log('Không phát hiện khuôn mặt nào')
                        // Không hiển thị alert mà callback lỗi
                        setIsLoading(false)
                        if (onFaceCropReady) {
                            onFaceCropReady('error-no-face')
                        }
                    }
                } catch (error) {
                    console.error('Lỗi xử lý ảnh:', error)
                    // Không hiển thị alert mà callback lỗi
                    setIsLoading(false)
                    if (onFaceCropReady) {
                        onFaceCropReady('error-processing')
                    }
                }
            }

            img.onerror = () => {
                console.error('Không thể tải ảnh')
                setIsLoading(false)
                if (onFaceCropReady) {
                    onFaceCropReady('error-loading')
                }
            }
        } catch (error) {
            console.error('Lỗi phát hiện khuôn mặt:', error)
            setIsLoading(false)
            if (onFaceCropReady) {
                onFaceCropReady('error-detection')
            }
        }
    }

    // Tạo ảnh đã cắt từ crop - Cải tiến để xử lý tự động
    const generateCroppedImage = (imgSrc: string, cropData: Crop | undefined) => {
        if (!cropData) {
            console.log('Không có dữ liệu crop')
            setFaceCrop(null) // Đảm bảo xóa ảnh cắt cũ nếu không có dữ liệu cắt mới
            setIsLoading(false)
            return
        }

        console.log('Bắt đầu tạo ảnh đã cắt với crop:', cropData)

        // Sử dụng phương pháp hiệu quả hơn để cắt ảnh
        const img = new Image()
        img.crossOrigin = 'anonymous' // Thêm để tránh vấn đề CORS khi xử lý canvas
        img.src = imgSrc

        // Đây là điểm quan trọng - đảm bảo ảnh được tải đầy đủ trước khi cắt
        if (img.complete) {
            console.log('Ảnh đã được tải sẵn, tiến hành cắt')
            cropImageNow()
        } else {
            console.log('Đợi ảnh tải xong...')
            img.onload = () => {
                console.log('Ảnh đã tải xong, tiến hành cắt')
                cropImageNow()
            }

            img.onerror = (e) => {
                console.error('Lỗi tải ảnh để cắt:', e)
                setFaceCrop(null) // Đảm bảo xóa ảnh cắt cũ nếu tải ảnh lỗi
                setIsLoading(false)
            }
        }

        function cropImageNow() {
            try {
                if (!cropData) return // Kiểm tra lại để tránh lỗi TypeScript

                console.log('Ảnh đã tải để cắt, kích thước:', img.width, 'x', img.height)

                // Tạo canvas để vẽ phần cắt
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')

                if (!ctx) {
                    console.error('Không thể tạo context cho canvas')
                    setIsLoading(false)
                    return
                }

                // Chuyển đổi phần trăm thành pixel
                const x = Math.round(img.width * (cropData.x / 100))
                const y = Math.round(img.height * (cropData.y / 100))
                const width = Math.round(img.width * (cropData.width / 100))
                const height = Math.round(img.height * (cropData.height / 100))

                // Đảm bảo các giá trị đều dương và hợp lệ
                const safeX = Math.max(0, x)
                const safeY = Math.max(0, y)
                const safeWidth = Math.max(1, Math.min(img.width - safeX, width))
                const safeHeight = Math.max(1, Math.min(img.height - safeY, height))

                console.log('Vùng cắt cuối cùng (pixels):', { x: safeX, y: safeY, width: safeWidth, height: safeHeight })

                // Đặt kích thước canvas
                canvas.width = safeWidth
                canvas.height = safeHeight

                // Xóa canvas và đặt nền trắng (để tránh ảnh trong suốt)
                ctx.fillStyle = '#FFFFFF'
                ctx.fillRect(0, 0, safeWidth, safeHeight)

                // Vẽ phần cắt lên canvas
                ctx.drawImage(
                    img,
                    safeX,
                    safeY,
                    safeWidth,
                    safeHeight, // Vùng nguồn
                    0,
                    0,
                    safeWidth,
                    safeHeight // Vùng đích
                )

                // Chuyển đổi canvas thành URL dữ liệu
                try {
                    const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.95)

                    if (croppedImageUrl.length > 22) {
                        // "data:image/jpeg;base64," = 22 ký tự
                        setFaceCrop(croppedImageUrl)
                        console.log('Đã tạo xong ảnh cắt, base64 length:', croppedImageUrl.length)
                        setIsLoading(false)
                    } else {
                        console.error('URL ảnh tạo ra không hợp lệ')
                        setFaceCrop(null)
                        setIsLoading(false)
                        if (onFaceCropReady) {
                            onFaceCropReady('error-invalid-result')
                        }
                    }
                } catch (e) {
                    console.error('Lỗi chuyển đổi canvas sang URL:', e)
                    setFaceCrop(null)
                    setIsLoading(false)
                    if (onFaceCropReady) {
                        onFaceCropReady('error-conversion')
                    }
                }
            } catch (error) {
                console.error('Lỗi khi xử lý ảnh cắt:', error)
                setFaceCrop(null)
                setIsLoading(false)
                if (onFaceCropReady) {
                    onFaceCropReady('error-processing')
                }
            }
        }
    }

    // Xử lý khi crop thay đổi - để lại cho trường hợp showUI=true
    const handleCropComplete = (_crop: Crop, percentCrop: Crop) => {
        if (imageSource && percentCrop.width && percentCrop.height) {
            console.log('Đang tạo ảnh cắt mới với crop hợp lệ:', percentCrop)
            generateCroppedImage(imageSource, percentCrop)
        } else {
            console.log('Crop không hợp lệ hoặc không có ảnh nguồn')
            setFaceCrop(null)
        }
    }

    // Nếu không hiển thị UI, vẫn trả về một div trống để component mount
    if (!showUI) {
        return (
            <div style={{ display: 'none' }}>
                {/* Preload image ref */}
                <img ref={imageRef} style={{ display: 'none' }} alt='preload' />
                {isLoading && <span>Loading...</span>}
                {detectorError && <span>{detectorError}</span>}
            </div>
        )
    }

    return (
        <div className='overflow-hidden'>
            {imageSource && (
                <div className='transition-all duration-300 ease-in-out'>
                    <ReactCrop
                        crop={crop}
                        onChange={(c) => {
                            setCrop(c)
                        }}
                        onComplete={handleCropComplete}
                        aspect={CONSTANTS.TY_LE_KHUNG}
                    >
                        <img
                            style={{
                                width: '100%',
                                maxWidth: '800px',
                                objectFit: 'contain'
                            }}
                            src={imageSource}
                            alt='Ảnh gốc'
                            crossOrigin='anonymous'
                        />
                    </ReactCrop>
                </div>
            )}

            {/* Hidden image for preloading */}
            {!imageSource && <img ref={imageRef} style={{ display: 'none' }} alt='preload' />}

            {/* Show loading indicator if needed */}
            {isLoading && (
                <div className='text-center p-4'>
                    <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto mb-2'></div>
                    <p>Đang xử lý...</p>
                </div>
            )}
        </div>
    )
}
