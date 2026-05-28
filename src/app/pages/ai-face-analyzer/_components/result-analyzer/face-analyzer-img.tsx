/* eslint-disable react-hooks/exhaustive-deps */
import { Eye } from 'lucide-react'
import { Skeleton } from 'primereact/skeleton'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useAnalysisStore } from '../../../../stores/analysis.store'
import { useEyebrowListStore } from '../../../../stores/eyebrown.store'
import { useModalStore } from '../../../../stores/modal.store'
import { STORAGE_KEYS } from '../../config'
import { Eyebrow } from '../../eyebrow-store'
import { DraggableBoxV3 } from './_components/DraggableBoxV3'
import { ModalV3 } from './_components/ModalV3'
// import temp from '../../../../../assets/imgs/temp.jpg'

// Helper function to add prefix to base64 image if needed
const addBase64Prefix = (base64String: string | undefined) => {
    if (!base64String || typeof base64String !== 'string') return ''

    // If already has a prefix, return as is
    if (base64String.startsWith('data:')) {
        return base64String
    }

    // Add the prefix
    return `data:image/jpeg;base64,${base64String}`
}
// ResultImageItem component props
interface FaceAnalyzerImgProps {
    title: string
    imageSrc: string
    onClick?: () => void
}

const ResultImageItem = ({ title, imageSrc, onClick }: FaceAnalyzerImgProps) => {
    const { isCallParamChange } = useAnalysisStore()
    const showSkeleton = isCallParamChange

    return (
        <div className='flex flex-col relative'>
            {showSkeleton ? (
                <div className='w-full rounded-[4px] overflow-hidden aspect-square relative'>
                    <Skeleton className='w-full !h-full !rounded-[4px] flex items-center justify-center flex-col gap-2'></Skeleton>
                    {/* Elegant overlay title */}
                    <div className='absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold select-none z-10 shadow-sm'>
                        {title}
                    </div>
                </div>
            ) : (
                <div
                    onClick={onClick}
                    className={`w-full aspect-square rounded-[4px] overflow-hidden relative group ${
                        onClick ? 'cursor-pointer' : ''
                    }`}
                >
                    <img
                        src={addBase64Prefix(imageSrc)}
                        alt={title}
                        className='w-full h-full object-cover rounded-[4px]'
                    />
                    {/* Hover eye icon overlay just like the bottom one */}
                    {onClick && (
                        <div className='absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-[5]'>
                            <Eye className='w-8 h-8 text-white' />
                        </div>
                    )}
                    {/* Elegant overlay title inside image */}
                    <div className='absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold select-none z-10 shadow-sm group-hover:bg-black/80 transition-all'>
                        {title}
                    </div>
                </div>
            )}
        </div>
    )
}

// Define interfaces for modal functionality
export interface Position {
    x: number
    y: number
}

export interface PlacedBox {
    id: string
    name: string
    image: string
    position: Position
    flip?: boolean
    originalPosition?: Position // Vị trí ban đầu để giới hạn di chuyển
    scale?: number // Tỷ lệ zoom của chân mày
    anchorPoint?: Position // Điểm neo cho scaling (inner corner)
}

interface TouchEventDetail {
    id: string
    name: string
    image: string
    offsetX: number
    offsetY: number
    flip: boolean
    clientX: number
    clientY: number
}

// Define the eyesBrowsType interface
export interface eyesBrowsType {
    pts_down_left_brows: number[][]
    pts_down_right_brows: number[][]
    pts_left_brows: number[][]
    pts_right_brows: number[][]
    pts_up_left_brows: number[][]
    pts_up_right_brows: number[][]
    center_points: number[][]
    left_points: number[][]
    right_points: number[][]
}

interface FaceAnalyzerImgSetProps {
    availableEyebrows: Eyebrow[]
    placedBoxes: PlacedBox[]
    setPlacedBoxes: (boxes: PlacedBox[]) => void
    onDoubleClick: (eyebrow: Eyebrow) => void
    savedPosition: Position | null
    setSavedPosition: (position: Position | null) => void
    dropZoneWidth: number
    setDropZoneWidth: (width: number) => void
    dropZoneHeight: number
    setDropZoneHeight: (height: number) => void
    eyebrowSize: { width: number; height: number }
    setEyebrowSize: (size: { width: number; height: number }) => void
    isLoadingModal: boolean
    setIsLoadingModal: (loading: boolean) => void
    onAutoSave?: () => void
    isFirstTimeApply: boolean
}

const FaceAnalyzerImgSet = ({
    placedBoxes,
    setPlacedBoxes,
    availableEyebrows,
    onDoubleClick,
    savedPosition,
    setSavedPosition,
    dropZoneWidth,
    setDropZoneWidth,
    dropZoneHeight,
    setDropZoneHeight,
    eyebrowSize,
    isLoadingModal,
    setIsLoadingModal,
    onAutoSave,
    isFirstTimeApply
}: FaceAnalyzerImgSetProps) => {
    const { analysisData, eyesBrows, isCallParamChange } = useAnalysisStore()
    const { setBase64RemoveEyebrow, base64RemoveEyebrow, setBase64WithEyebrow, base64WithEyebrow } = useEyebrowListStore()
    const dropZoneRef = useRef<HTMLDivElement>(null)
    const modalDropZoneRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const { openModalPreview, setOpenModalPreview, syncMode, toggleSyncMode } = useModalStore()
    console.log('analysisData', analysisData)
    const [isDraggingOver, setIsDraggingOver] = useState(false)
    const [hidePlacedBoxes, setHidePlacedBoxes] = useState(false)
    const [showPoints, setShowPoints] = useState(false)
    const [showOverlayImage, setShowOverlayImage] = useState(false)
    const [showDrawLines, setShowDrawLines] = useState(true)
    const [modalDropZoneWidth, setModalDropZoneWidth] = useState(0)
    const [modalDropZoneHeight, setModalDropZoneHeight] = useState(0)
    const [scaleFactorX, setScaleFactorX] = useState(1)
    const [scaleFactorY, setScaleFactorY] = useState(1)
    const [, setSavedImage] = useState<string | null>(null)
    const [activeTouchBox, setActiveTouchBox] = useState<{
        id: string
        name: string
        image: string
        offsetX: number
        offsetY: number
        flip: boolean
    } | null>(null)



    // Giới hạn di chuyển chân mày: X và Y đều giới hạn trong khoảng ±5px từ vị trí ban đầu
    const getConstrainedPosition = (newX: number, newY: number, originalPosition: Position): Position => {
        const MOVEMENT_LIMIT = 5 // ±5px cho cả X và Y

        // Giới hạn X trong khoảng ±5px từ vị trí ban đầu
        const constrainedX = Math.max(originalPosition.x - MOVEMENT_LIMIT, Math.min(originalPosition.x + MOVEMENT_LIMIT, newX))

        // Giới hạn Y trong khoảng ±5px từ vị trí ban đầu
        const constrainedY = Math.max(originalPosition.y - MOVEMENT_LIMIT, Math.min(originalPosition.y + MOVEMENT_LIMIT, newY))

        return {
            x: constrainedX,
            y: constrainedY
        }
    }

    // Position eyebrows based on facial landmarks
    // const positionEyebrowsOnLandmarks = (eyebrow: Eyebrow) => {
    //     if (!eyesBrows || !modalDropZoneRef.current) return false

    //     const calculateCenterPoint = (points: number[][]) => {
    //         if (!points || points.length === 0) return null
    //         const sumX = points.reduce((sum, point) => sum + point[0], 0)
    //         const sumY = points.reduce((sum, point) => sum + point[1], 0)
    //         return [sumX / points.length, sumY / points.length]
    //     }

    //     const leftCenterPoint = calculateCenterPoint(eyesBrows.pts_left_brows)
    //     const rightCenterPoint = calculateCenterPoint(eyesBrows.pts_right_brows)

    //     if (leftCenterPoint && rightCenterPoint) {
    //         const leftId = `${eyebrow.id}-left`
    //         const rightId = `${eyebrow.id}-right`

    //         const leftPosition = {
    //             x: (leftCenterPoint[0] / 1028) * dropZoneWidth - eyebrowSize.width / 2,
    //             y: (leftCenterPoint[1] / 1028) * dropZoneHeight - eyebrowSize.height / 2
    //         }

    //         const rightPosition = {
    //             x: (rightCenterPoint[0] / 1028) * dropZoneWidth - eyebrowSize.width / 2,
    //             y: (rightCenterPoint[1] / 1028) * dropZoneHeight - eyebrowSize.height / 2
    //         }

    //         const newBoxes: PlacedBox[] = [
    //             {
    //                 id: leftId,
    //                 name: eyebrow.name,
    //                 image: eyebrow.image,
    //                 position: leftPosition,
    //                 originalPosition: leftPosition, // Lưu vị trí ban đầu
    //                 flip: false,
    //                 scale: 1, // Scale mặc định
    //                 anchorPoint: {
    //                     // Inner corner của chân mày trái (điểm đầu to nhất) - bên phải của image
    //                     x: leftPosition.x + eyebrowSize.width * 0.8, // 80% về phía inner corner
    //                     y: leftPosition.y
    //                 }
    //             },
    //             {
    //                 id: rightId,
    //                 name: eyebrow.name,
    //                 image: eyebrow.image,
    //                 position: rightPosition,
    //                 originalPosition: rightPosition, // Lưu vị trí ban đầu
    //                 flip: true,
    //                 scale: 1, // Scale mặc định
    //                 anchorPoint: {
    //                     // Inner corner của chân mày phải (điểm đầu to nhất) - bên trái của image (do flip)
    //                     x: rightPosition.x + eyebrowSize.width * 0.2, // 20% từ bên trái (do flip)
    //                     y: rightPosition.y
    //                 }
    //             }
    //         ]

    //         setPlacedBoxes(newBoxes)
    //         setSavedPosition(leftPosition)
    //         return true
    //     }

    //     return false
    // }

    // Draw points and lines on canvas
    const drawPointsAndLines = () => {
        if (!openModalPreview) return

        const canvas = canvasRef.current
        if (!canvas || !modalDropZoneRef.current || !eyesBrows) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (!showPoints && !showDrawLines) return

        const rect = modalDropZoneRef.current.getBoundingClientRect()
        const modalWidth = rect.width
        const modalHeight = rect.height

        const scaleX = canvas.width / modalWidth
        const scaleY = canvas.height / modalHeight

        // Helper function to scale coordinates
        const scaleCoords = (x: number, y: number) => ({
            x: (x / 1028) * modalWidth * scaleX,
            y: (y / 1028) * modalHeight * scaleY
        })

        // Draw points function with customizable size and index
        const drawPoints = (points: number[][], color: string, prefix: string, size: number = 1.5) => {
            points.forEach(([x, y], index) => {
                const { x: scaledX, y: scaledY } = scaleCoords(x, y)

                // Draw glow effect (smaller and softer)
                ctx.beginPath()
                ctx.fillStyle = color + '20' // 12.5% opacity
                ctx.arc(scaledX, scaledY, size * 2, 0, 2 * Math.PI)
                ctx.fill()

                ctx.beginPath()
                ctx.fillStyle = color + '40' // 25% opacity
                ctx.arc(scaledX, scaledY, size * 1.5, 0, 2 * Math.PI)
                ctx.fill()

                // Draw center point (smaller)
                ctx.beginPath()
                ctx.fillStyle = color
                ctx.arc(scaledX, scaledY, size, 0, 2 * Math.PI)
                ctx.fill()

                // Draw index number (smaller) if SHOW_POINT_NUMBERS is true
                if (SHOW_POINT_NUMBERS) {
                    ctx.fillStyle = color
                    ctx.font = '8px Arial'
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'bottom'
                    ctx.fillText(`${prefix}${index + 1}`, scaledX, scaledY - 4)
                }
            })
        }

        const POINT_COLOR = '#00E5FF' // Light cyan color
        const SHOW_POINT_NUMBERS = false // Set to true to show point numbers

        // Get points from analysisData
        const { center_points, left_points, right_points } = analysisData?.eyes_brows || {}

        // Draw all points first
        if (showPoints) {
            if (center_points?.length) {
                drawPoints(center_points, POINT_COLOR, 'C', 2)
            }

            if (left_points?.length) {
                drawPoints(left_points, POINT_COLOR, 'L', 2)
            }

            if (right_points?.length) {
                drawPoints(right_points, POINT_COLOR, 'R', 2)
            }
        }

        // Helper function to draw dashed line
        const drawDashedLine = (fromPoints: number[][], fromIndex: number, toPoints: number[][], toIndex: number) => {
            const startPoint = scaleCoords(fromPoints[fromIndex][0], fromPoints[fromIndex][1])
            const endPoint = scaleCoords(toPoints[toIndex][0], toPoints[toIndex][1])

            ctx.beginPath()
            ctx.strokeStyle = POINT_COLOR
            ctx.lineWidth = 1
            ctx.setLineDash([4, 4])
            ctx.moveTo(startPoint.x, startPoint.y)
            ctx.lineTo(endPoint.x, endPoint.y)
            ctx.stroke()
        }

        // Draw all connections if we have enough points (only when showPoints is true)
        if (showPoints) {
            if (left_points && left_points.length >= 9) {
                // Left side connections
                drawDashedLine(left_points, 8, left_points, 0) // L9 to L1
                drawDashedLine(left_points, 8, left_points, 2) // L9 to L3
                drawDashedLine(left_points, 8, left_points, 5) // L9 to L6
            }

            if (right_points && right_points.length >= 9) {
                // Right side connections
                drawDashedLine(right_points, 8, right_points, 0) // R9 to R1
                drawDashedLine(right_points, 8, right_points, 2) // R9 to R3
                drawDashedLine(right_points, 8, right_points, 5) // R9 to R6
            }

            // Draw horizontal connections
            if (left_points && right_points && left_points.length >= 6 && right_points.length >= 6) {
                // L5 to R5
                drawDashedLine(left_points, 4, right_points, 4)
                // L6 to R6
                drawDashedLine(left_points, 5, right_points, 5)
            }
        }

        // Draw lines from draw_line_point data
        if (showDrawLines && analysisData?.draw_line_point) {
            const drawLinePoint = analysisData.draw_line_point

            // Helper function to draw dashed line
            const drawDashedLineFromPoints = (points: number[][], color: string = '#FF6B6B', lineWidth: number = 1) => {
                if (!points || points.length < 2) return

                ctx.beginPath()
                ctx.strokeStyle = color
                ctx.lineWidth = lineWidth
                ctx.setLineDash([4, 4]) // Dashed line

                const startPoint = scaleCoords(points[0][0], points[0][1])
                ctx.moveTo(startPoint.x, startPoint.y)

                for (let i = 1; i < points.length; i++) {
                    const point = scaleCoords(points[i][0], points[i][1])
                    ctx.lineTo(point.x, point.y)
                }

                ctx.stroke()
            }

            // Draw only the side lines of triangle (skip horizontal line and top triangle line)
            if (drawLinePoint.triangle_line && drawLinePoint.triangle_line.length >= 3) {
                // Draw left side of triangle (from point 0 to point 2)
                const leftTriangleLine = [
                    drawLinePoint.triangle_line[0], // First point (top)
                    drawLinePoint.triangle_line[2] // Third point (bottom right)
                ]
                drawDashedLineFromPoints(leftTriangleLine as unknown as number[][], '#4ECDC4', 1)

                // Draw right side of triangle (from point 1 to point 2)
                const rightTriangleLine = [
                    drawLinePoint.triangle_line[1], // Second point (top)
                    drawLinePoint.triangle_line[2] // Third point (bottom right)
                ]
                drawDashedLineFromPoints(rightTriangleLine as unknown as number[][], '#4ECDC4', 1)
            }

            // Draw vertical lines
            const verticalLineColor = '#FFE66D'
            if (drawLinePoint.vertical_line_left_eye) {
                drawDashedLineFromPoints(drawLinePoint.vertical_line_left_eye as unknown as number[][], verticalLineColor, 0.8)
            }
            if (drawLinePoint.vertical_line_left_nose) {
                drawDashedLineFromPoints(drawLinePoint.vertical_line_left_nose as unknown as number[][], verticalLineColor, 0.8)
            }
            if (drawLinePoint.vertical_line_midface) {
                drawDashedLineFromPoints(drawLinePoint.vertical_line_midface as unknown as number[][], verticalLineColor, 0.8)
            }
            if (drawLinePoint.vertical_line_right_eye) {
                drawDashedLineFromPoints(drawLinePoint.vertical_line_right_eye as unknown as number[][], verticalLineColor, 0.8)
            }
            if (drawLinePoint.vertical_line_right_nose) {
                drawDashedLineFromPoints(drawLinePoint.vertical_line_right_nose as unknown as number[][], verticalLineColor, 0.8)
            }
        }

        ctx.setLineDash([]) // Reset lại nét đứt về mặc định
    }

    // Toggle points visibility
    const togglePoints = () => {
        setShowPoints(!showPoints)
        if (!showPoints && !openModalPreview) {
            setOpenModalPreview(true)
        }
    }

    // Toggle overlay image
    const toggleOverlayImage = () => {
        setShowOverlayImage(!showOverlayImage)
    }

    // Toggle draw lines visibility
    const toggleDrawLines = () => {
        setShowDrawLines(!showDrawLines)
    }

    // Update canvas when points visibility changes or modal state changes
    useEffect(() => {
        drawPointsAndLines()
    }, [showPoints, showDrawLines, openModalPreview, modalDropZoneWidth, modalDropZoneHeight, placedBoxes])

    // Load saved image from localStorage on component mount
    useEffect(() => {
        const savedImageData = localStorage.getItem(STORAGE_KEYS.EYEBROW_IMAGE)
        if (savedImageData) {
            setSavedImage(savedImageData)
        }

        if (dropZoneWidth > 0 && dropZoneHeight > 0) {
            const savedBoxesData = localStorage.getItem(STORAGE_KEYS.PLACED_BOXES)
            if (savedBoxesData) {
                try {
                    // Load saved boxes logic can be added here if needed
                } catch (error) {
                    console.error('Error parsing saved boxes data:', error)
                }
            }
        }
    }, [dropZoneWidth, dropZoneHeight])

    // Update dimensions
    // Update dimensions for outside container using ResizeObserver
    useEffect(() => {
        const updateDimensions = () => {
            if (dropZoneRef.current) {
                const width = dropZoneRef.current.offsetWidth
                const height = dropZoneRef.current.offsetHeight
                setDropZoneWidth(width)
                setDropZoneHeight(height)
                localStorage.setItem(STORAGE_KEYS.DROPZONE_SIZE, JSON.stringify({ width, height }))
            }
        }

        updateDimensions()

        const resizeObserver = new ResizeObserver(() => {
            updateDimensions()
        })

        if (dropZoneRef.current) {
            resizeObserver.observe(dropZoneRef.current)
        }

        return () => {
            resizeObserver.disconnect()
        }
    }, [])

    // Update dimensions for modal container using ResizeObserver
    useEffect(() => {
        if (!openModalPreview) return

        const updateModalDimensions = () => {
            if (modalDropZoneRef.current) {
                const modalWidth = modalDropZoneRef.current.offsetWidth
                const modalHeight = modalDropZoneRef.current.offsetHeight
                setModalDropZoneWidth(modalWidth)
                setModalDropZoneHeight(modalHeight)

                const effectiveModalWidth = modalWidth
                const effectiveModalHeight = modalHeight
                setScaleFactorX(effectiveModalWidth / 302)
                setScaleFactorY(effectiveModalHeight / 302)

                if (canvasRef.current) {
                    canvasRef.current.width = modalWidth
                    canvasRef.current.height = modalHeight
                    drawPointsAndLines()
                }
            }
        }

        // Run with small delay to ensure modal transitions are complete and dimensions are stable
        const timer = setTimeout(() => {
            updateModalDimensions()
        }, 60)

        const resizeObserver = new ResizeObserver(() => {
            updateModalDimensions()
        })

        if (modalDropZoneRef.current) {
            resizeObserver.observe(modalDropZoneRef.current)
        }

        return () => {
            clearTimeout(timer)
            resizeObserver.disconnect()
        }
    }, [openModalPreview, placedBoxes])

    // Drag & Drop handlers for modal
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDraggingOver(true)
        if (!openModalPreview) {
            setHidePlacedBoxes(true)
        }
    }

    const handleDragLeave = () => {
        setIsDraggingOver(false)
        setHidePlacedBoxes(false)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDraggingOver(false)
        setHidePlacedBoxes(false)
        setOpenModalPreview(true)
    }

    // Place single eyebrow
    const placeSingleEyebrow = (
        id: string,
        name: string,
        image: string,
        x: number,
        y: number,
        flip: boolean = false,
        isFromSaved: boolean = false
    ) => {
        const isRightEyebrow = id.endsWith('-right') || flip

        // Tìm chân mày hiện tại để lấy originalPosition và scale
        const existingBox = placedBoxes.find((box) => {
            const boxIsRight = box.id.endsWith('-right') || box.flip
            return boxIsRight === isRightEyebrow
        })

        let finalPosition = { x, y }

        // Chỉ áp dụng savedPosition nếu isFromSaved = true và có savedPosition
        if (isFromSaved && savedPosition) {
            finalPosition = savedPosition
        }

        // Áp dụng giới hạn di chuyển chỉ khi có originalPosition và position thực sự thay đổi
        if (
            existingBox?.originalPosition &&
            (finalPosition.x !== existingBox.position.x || finalPosition.y !== existingBox.position.y)
        ) {
            finalPosition = getConstrainedPosition(finalPosition.x, finalPosition.y, existingBox.originalPosition)
        }

        const currentBoxes = placedBoxes.filter((box) => {
            const boxIsRight = box.id.endsWith('-right') || box.flip
            return boxIsRight !== isRightEyebrow
        })

        setPlacedBoxes([
            ...currentBoxes,
            {
                id,
                name,
                image,
                position: finalPosition,
                originalPosition: existingBox?.originalPosition || finalPosition, // Giữ nguyên originalPosition hoặc tạo mới
                flip: isRightEyebrow,
                scale: existingBox?.scale || 1, // Preserve scale hoặc set default là 1
                anchorPoint: existingBox?.anchorPoint || finalPosition // Preserve anchorPoint
            }
        ])

        // Chỉ update savedPosition nếu position thực sự thay đổi
        if (!isFromSaved) {
            setSavedPosition(finalPosition)
        }
    }

    // Convert position functions
    const convertPositionFromOutsideToModal = (x: number, y: number): Position => {
        return {
            x: Math.round(x * scaleFactorX * 100) / 100,
            y: Math.round(y * scaleFactorY * 100) / 100
        }
    }

    const convertPositionFromModalToOutside = (x: number, y: number): Position => {
        return {
            x: Math.round((x / scaleFactorX) * 100) / 100,
            y: Math.round((y / scaleFactorY) * 100) / 100
        }
    }

    // Handle drag events for modal
    const handleBoxDragMoveInModal = (e: Event) => {
        const detail = (e as CustomEvent<TouchEventDetail>).detail
        if (!modalDropZoneRef.current) return

        const rect = modalDropZoneRef.current.getBoundingClientRect()
        const clientX = detail.clientX
        const clientY = detail.clientY
        const isOverDropZone = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom

        if (isOverDropZone) {
            const x = clientX - rect.left - detail.offsetX
            const y = clientY - rect.top - detail.offsetY
            const isRightEyebrow = detail.flip || detail.id.endsWith('-right')

            const convertedPosition = convertPositionFromModalToOutside(x, y)

            if (syncMode) {
                // In sync mode, update both eyebrows - move both up/down together
                const leftEyebrow = placedBoxes.find((box) => !box.flip)
                const rightEyebrow = placedBoxes.find((box) => box.flip)

                if (leftEyebrow && rightEyebrow) {
                    // Áp dụng giới hạn di chuyển cho cả hai chân mày
                    let leftConstrainedPosition = { x: leftEyebrow.position.x, y: convertedPosition.y }
                    let rightConstrainedPosition = { x: rightEyebrow.position.x, y: convertedPosition.y }

                    if (leftEyebrow.originalPosition) {
                        leftConstrainedPosition = getConstrainedPosition(
                            leftEyebrow.position.x,
                            convertedPosition.y,
                            leftEyebrow.originalPosition
                        )
                    }

                    if (rightEyebrow.originalPosition) {
                        rightConstrainedPosition = getConstrainedPosition(
                            rightEyebrow.position.x,
                            convertedPosition.y,
                            rightEyebrow.originalPosition
                        )
                    }

                    const newBoxes: PlacedBox[] = [
                        {
                            ...leftEyebrow,
                            position: leftConstrainedPosition
                        },
                        {
                            ...rightEyebrow,
                            position: rightConstrainedPosition
                        }
                    ]
                    setPlacedBoxes(newBoxes)
                    setSavedPosition(leftConstrainedPosition)
                }
            } else {
                placeSingleEyebrow(detail.id, detail.name, detail.image, convertedPosition.x, convertedPosition.y, isRightEyebrow)
            }
        }
    }

    const handleBoxDragEndInModal = (e: Event) => {
        const detail = (e as CustomEvent<TouchEventDetail>).detail
        if (!modalDropZoneRef.current) return

        const rect = modalDropZoneRef.current.getBoundingClientRect()
        const clientX = detail.clientX
        const clientY = detail.clientY
        const isOverDropZone = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom

        if (isOverDropZone) {
            const x = clientX - rect.left - detail.offsetX
            const y = clientY - rect.top - detail.offsetY
            const isRightEyebrow = detail.flip || detail.id.endsWith('-right')

            const convertedPosition = convertPositionFromModalToOutside(x, y)
            const isFromSaved = savedPosition !== null

            if (syncMode) {
                // In sync mode, finalize both eyebrows position
                const leftEyebrow = placedBoxes.find((box) => !box.flip)
                const rightEyebrow = placedBoxes.find((box) => box.flip)

                if (leftEyebrow && rightEyebrow) {
                    // Áp dụng giới hạn di chuyển cho cả hai chân mày
                    let leftConstrainedPosition = { x: leftEyebrow.position.x, y: convertedPosition.y }
                    let rightConstrainedPosition = { x: rightEyebrow.position.x, y: convertedPosition.y }

                    if (leftEyebrow.originalPosition) {
                        leftConstrainedPosition = getConstrainedPosition(
                            leftEyebrow.position.x,
                            convertedPosition.y,
                            leftEyebrow.originalPosition
                        )
                    }

                    if (rightEyebrow.originalPosition) {
                        rightConstrainedPosition = getConstrainedPosition(
                            rightEyebrow.position.x,
                            convertedPosition.y,
                            rightEyebrow.originalPosition
                        )
                    }

                    const newBoxes: PlacedBox[] = [
                        {
                            ...leftEyebrow,
                            position: leftConstrainedPosition
                        },
                        {
                            ...rightEyebrow,
                            position: rightConstrainedPosition
                        }
                    ]
                    setPlacedBoxes(newBoxes)
                    setSavedPosition(leftConstrainedPosition)
                }
            } else {
                placeSingleEyebrow(
                    detail.id,
                    detail.name,
                    detail.image,
                    convertedPosition.x,
                    convertedPosition.y,
                    isRightEyebrow,
                    isFromSaved
                )
            }
        }
    }

    // Touch handlers for modal
    const handleBoxTouchStart = (e: CustomEvent<TouchEventDetail>) => {
        const detail = e.detail
        setActiveTouchBox({
            id: detail.id,
            name: detail.name,
            image: detail.image || '',
            offsetX: detail.offsetX,
            offsetY: detail.offsetY,
            flip: detail.flip || false
        })
    }

    const handleBoxTouchMoveInModal = (e: CustomEvent<TouchEventDetail>) => {
        if (!activeTouchBox || !modalDropZoneRef.current) return
        const detail = e.detail
        const rect = modalDropZoneRef.current.getBoundingClientRect()
        const clientX = detail.clientX
        const clientY = detail.clientY
        const isOverDropZone = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom

        if (isOverDropZone) {
            const x = clientX - rect.left - activeTouchBox.offsetX
            const y = clientY - rect.top - activeTouchBox.offsetY
            const isRightEyebrow = activeTouchBox.flip || activeTouchBox.id.endsWith('-right')

            const convertedPosition = convertPositionFromModalToOutside(x, y)

            if (syncMode) {
                // In sync mode, update both eyebrows - move both up/down together
                const leftEyebrow = placedBoxes.find((box) => !box.flip)
                const rightEyebrow = placedBoxes.find((box) => box.flip)

                if (leftEyebrow && rightEyebrow) {
                    // Áp dụng giới hạn di chuyển cho cả hai chân mày
                    let leftConstrainedPosition = { x: leftEyebrow.position.x, y: convertedPosition.y }
                    let rightConstrainedPosition = { x: rightEyebrow.position.x, y: convertedPosition.y }

                    if (leftEyebrow.originalPosition) {
                        leftConstrainedPosition = getConstrainedPosition(
                            leftEyebrow.position.x,
                            convertedPosition.y,
                            leftEyebrow.originalPosition
                        )
                    }

                    if (rightEyebrow.originalPosition) {
                        rightConstrainedPosition = getConstrainedPosition(
                            rightEyebrow.position.x,
                            convertedPosition.y,
                            rightEyebrow.originalPosition
                        )
                    }

                    const newBoxes: PlacedBox[] = [
                        {
                            ...leftEyebrow,
                            position: leftConstrainedPosition
                        },
                        {
                            ...rightEyebrow,
                            position: rightConstrainedPosition
                        }
                    ]
                    setPlacedBoxes(newBoxes)
                    setSavedPosition(leftConstrainedPosition)
                }
            } else {
                placeSingleEyebrow(
                    activeTouchBox.id,
                    activeTouchBox.name,
                    activeTouchBox.image,
                    convertedPosition.x,
                    convertedPosition.y,
                    isRightEyebrow
                )
            }
        }
    }

    const handleBoxTouchEndInModal = (e: CustomEvent<TouchEventDetail>) => {
        if (!activeTouchBox || !modalDropZoneRef.current) {
            setActiveTouchBox(null)
            return
        }

        const detail = e.detail
        const rect = modalDropZoneRef.current.getBoundingClientRect()
        const clientX = detail.clientX
        const clientY = detail.clientY
        const isOverDropZone = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom

        if (isOverDropZone) {
            const x = clientX - rect.left - activeTouchBox.offsetX
            const y = clientY - rect.top - activeTouchBox.offsetY
            const isRightEyebrow = activeTouchBox.flip || activeTouchBox.id.endsWith('-right')

            const convertedPosition = convertPositionFromModalToOutside(x, y)
            const isFromSaved = savedPosition !== null

            const existingBox = placedBoxes.find((box) => (isRightEyebrow ? box.flip : !box.flip))

            if (existingBox && !isDraggingOver) {
                if (syncMode) {
                    // In sync mode, keep both eyebrows at existing position
                    const leftEyebrow = placedBoxes.find((box) => !box.flip)
                    const rightEyebrow = placedBoxes.find((box) => box.flip)

                    if (leftEyebrow && rightEyebrow) {
                        setPlacedBoxes([
                            { ...leftEyebrow, position: { ...leftEyebrow.position } },
                            { ...rightEyebrow, position: { ...rightEyebrow.position } }
                        ])
                    }
                } else {
                    placeSingleEyebrow(
                        activeTouchBox.id,
                        activeTouchBox.name,
                        activeTouchBox.image,
                        existingBox.position.x,
                        existingBox.position.y,
                        isRightEyebrow,
                        true
                    )
                }
            } else {
                if (syncMode) {
                    // In sync mode, finalize both eyebrows position
                    const leftEyebrow = placedBoxes.find((box) => !box.flip)
                    const rightEyebrow = placedBoxes.find((box) => box.flip)

                    if (leftEyebrow && rightEyebrow) {
                        // Áp dụng giới hạn di chuyển cho cả hai chân mày
                        let leftConstrainedPosition = { x: leftEyebrow.position.x, y: convertedPosition.y }
                        let rightConstrainedPosition = { x: rightEyebrow.position.x, y: convertedPosition.y }

                        if (leftEyebrow.originalPosition) {
                            leftConstrainedPosition = getConstrainedPosition(
                                leftEyebrow.position.x,
                                convertedPosition.y,
                                leftEyebrow.originalPosition
                            )
                        }

                        if (rightEyebrow.originalPosition) {
                            rightConstrainedPosition = getConstrainedPosition(
                                rightEyebrow.position.x,
                                convertedPosition.y,
                                rightEyebrow.originalPosition
                            )
                        }

                        const newBoxes: PlacedBox[] = [
                            {
                                ...leftEyebrow,
                                position: leftConstrainedPosition
                            },
                            {
                                ...rightEyebrow,
                                position: rightConstrainedPosition
                            }
                        ]
                        setPlacedBoxes(newBoxes)
                        setSavedPosition(leftConstrainedPosition)
                    }
                } else {
                    placeSingleEyebrow(
                        activeTouchBox.id,
                        activeTouchBox.name,
                        activeTouchBox.image,
                        convertedPosition.x,
                        convertedPosition.y,
                        isRightEyebrow,
                        isFromSaved
                    )
                }
            }
        }

        setActiveTouchBox(null)
    }

    // Handle double click on eyebrow
    const handleEyebrowDoubleClick = (eyebrow: Eyebrow) => {
        // Kiểm tra xem chân mày này đã được đặt hay chưa
        const isEyebrowAlreadyPlaced = placedBoxes.some((box) => box.image === eyebrow.image || box.image.includes(eyebrow.image))

        // Nếu chân mây đã được đặt, không làm gì cả
        if (isEyebrowAlreadyPlaced) {
            return
        }

        // Nếu chân mày chưa được đặt, gọi onDoubleClick từ parent để xử lý đúng
        onDoubleClick(eyebrow)
    }

    // Toggle sync mode
    const handleToggleSyncMode = () => {
        // Simply toggle the sync mode without changing positions
        toggleSyncMode()

        // Keep all existing positions unchanged
        // No need to reset or recalculate positions when switching modes
    }


    // Auto-save images when placedBoxes are set and modal dimensions are ready
    // useEffect(() => {
    //     if (placedBoxes.length > 0 && modalDropZoneWidth > 0 && modalDropZoneHeight > 0 && onAutoSave) {
    //         // Small delay to ensure dimensions are properly set
    //         const timeoutId = setTimeout(() => {
    //             onAutoSave()
    //         }, 100)
    //         return () => clearTimeout(timeoutId)
    //     }
    // }, [placedBoxes.length, modalDropZoneWidth, modalDropZoneHeight, onAutoSave])

    // Event listeners for modal drag & drop
    useEffect(() => {
        if (!openModalPreview) return

        const handleDragMove = (e: Event) => {
            handleBoxDragMoveInModal(e)
        }

        const handleDragEnd = (e: Event) => {
            handleBoxDragEndInModal(e)
        }

        const handleTouchMove = (e: Event) => {
            handleBoxTouchMoveInModal(e as CustomEvent<TouchEventDetail>)
        }

        const handleTouchEnd = (e: Event) => {
            handleBoxTouchEndInModal(e as CustomEvent<TouchEventDetail>)
        }

        document.addEventListener('box-touch-start', handleBoxTouchStart as EventListener)
        document.addEventListener('box-touch-move', handleTouchMove)
        document.addEventListener('box-touch-end', handleTouchEnd)
        document.addEventListener('box-drag-move', handleDragMove)
        document.addEventListener('box-drag-end', handleDragEnd)

        return () => {
            document.removeEventListener('box-touch-start', handleBoxTouchStart as EventListener)
            document.removeEventListener('box-touch-move', handleTouchMove)
            document.removeEventListener('box-touch-end', handleTouchEnd)
            document.removeEventListener('box-drag-move', handleDragMove)
            document.removeEventListener('box-drag-end', handleDragEnd)
        }
    }, [
        openModalPreview,
        modalDropZoneWidth,
        modalDropZoneHeight,
        scaleFactorX,
        scaleFactorY,
        syncMode,
        activeTouchBox,
        placedBoxes,
        savedPosition
    ])

    // Save modal image to localStorage
    const saveModalImage = () => {
        if (
            !modalDropZoneRef.current ||
            !analysisData?.output_remove_eyebrows_final_b64_string ||
            !analysisData?.output_with_eyebrows_orginal_final_b64_string
        ) {
            console.error('Modal ref or background images not available')
            return
        }

        try {
            const canvasWidth = modalDropZoneWidth || 302
            const canvasHeight = modalDropZoneHeight || 302

            // Function to create eyebrow image with given background
            const createEyebrowImage = (backgroundImageSrc: string): Promise<string> => {
                return new Promise((resolve, reject) => {
                    const canvas = document.createElement('canvas')
                    const ctx = canvas.getContext('2d')
                    if (!ctx) {
                        reject(new Error('Failed to get canvas context'))
                        return
                    }

                    canvas.width = canvasWidth
                    canvas.height = canvasHeight

                    const backgroundImg = new HTMLImageElement()
                    backgroundImg.crossOrigin = 'anonymous'

                    backgroundImg.onload = () => {
                        // Draw background to fill the canvas exactly (100% 100%)
                        const canvasW = canvas.width
                        const canvasH = canvas.height
                        const offsetX = 0
                        const offsetY = 0
                        ctx.clearRect(0, 0, canvasW, canvasH)
                        ctx.drawImage(backgroundImg, 0, 0, canvasW, canvasH)

                        const loadEyebrowImages = async () => {
                            const eyebrowPromises = placedBoxes.map((box) => {
                                return new Promise<void>((resolve) => {
                                    const img = new HTMLImageElement()
                                    img.crossOrigin = 'anonymous'

                                    img.onload = () => {
                                        const modalPosition = convertPositionFromOutsideToModal(box.position.x, box.position.y)
                                        const scale = box.scale || 1
                                        const scaledWidth = eyebrowSize.width * scale * (canvasWidth / 302)
                                        const scaledHeight = scaledWidth * (img.height / img.width)

                                        // Apply same letterbox offsets so eyebrows align to background
                                        const drawX = modalPosition.x + offsetX
                                        const drawY = modalPosition.y + offsetY

                                        if (box.flip) {
                                            ctx.save()
                                            ctx.scale(-1, 1)
                                            ctx.drawImage(img, -(drawX + scaledWidth), drawY, scaledWidth, scaledHeight)
                                            ctx.restore()
                                        } else {
                                            ctx.drawImage(img, drawX, drawY, scaledWidth, scaledHeight)
                                        }
                                        resolve()
                                    }

                                    img.onerror = () => {
                                        console.error('Failed to load eyebrow image:', box.image)
                                        resolve()
                                    }

                                    img.src = addBase64Prefix(box.image)
                                })
                            })

                            await Promise.all(eyebrowPromises)
                            const base64Data = canvas.toDataURL('image/png')
                            resolve(base64Data)
                        }

                        loadEyebrowImages()
                    }

                    backgroundImg.onerror = () => {
                        reject(new Error('Failed to load background image'))
                    }

                    backgroundImg.src = backgroundImageSrc
                })
            }

            // Create both images simultaneously
            Promise.all([
                createEyebrowImage(addBase64Prefix(analysisData.output_remove_eyebrows_final_b64_string)),
                createEyebrowImage(addBase64Prefix(analysisData.output_with_eyebrows_orginal_final_b64_string))
            ])
                .then(([removeEyebrowImage, withEyebrowImage]) => {
                    setBase64RemoveEyebrow(removeEyebrowImage)
                    setBase64WithEyebrow(withEyebrowImage)
                    // close modal
                    setOpenModalPreview(false)
                })
                .catch((error) => {
                    console.error('Error creating eyebrow images:', error)
                })

            onAutoSave?.()
            setOpenModalPreview(false)
        } catch (error) {
            console.error('Error saving modal image:', error)
        }
    }

    const handleOpenModal = (showOriginal: boolean) => {
        setShowOverlayImage(showOriginal)
        if (isFirstTimeApply) {
            setIsLoadingModal(true)
            setTimeout(() => {
                setIsLoadingModal(false)
                setOpenModalPreview(true)
            }, 3000)
        } else {
            setOpenModalPreview(true)
        }
    }

    return (
        <Fragment>
            <div className='w-full grid grid-cols-1 md:grid-cols-3 gap-3.5 items-stretch'>
                <ResultImageItem
                    title='Ảnh gốc'
                    imageSrc={analysisData?.input_final_b64_string || ''}
                    onClick={() => handleOpenModal(true)}
                />
                <ResultImageItem
                    title='Đè chân mày'
                    imageSrc={
                        base64WithEyebrow ? base64WithEyebrow : analysisData?.output_with_eyebrows_orginal_final_b64_string || ''
                    }
                    onClick={() => handleOpenModal(true)}
                />
                <div className='flex flex-col relative'>
                    {isCallParamChange ? (
                        <div className='w-full rounded-[4px] overflow-hidden aspect-square relative'>
                            <Skeleton className='w-full !h-full !rounded-[4px] flex items-center justify-center flex-col gap-2'></Skeleton>
                            {/* Elegant overlay title */}
                            <div className='absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold select-none z-10 shadow-sm'>
                                Ảnh xóa chân mày
                            </div>
                        </div>
                    ) : (
                        <div className='w-full aspect-square rounded-[4px] overflow-hidden relative'>
                            <div
                                ref={dropZoneRef}
                                style={{
                                    backgroundImage: base64RemoveEyebrow
                                        ? `url(${base64RemoveEyebrow})`
                                        : `url(${addBase64Prefix(analysisData?.output_remove_eyebrows_final_b64_string)})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    position: 'relative',
                                    borderRadius: '4px'
                                }}
                                className='relative group w-full h-full cursor-pointer'
                                onClick={() => handleOpenModal(false)}
                            >
                                <div className='absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                                    <Eye className='w-8 h-8 text-white' />
                                </div>
                                {/* Elegant overlay title inside image */}
                                <div className='absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold select-none z-10 shadow-sm group-hover:bg-black/80 transition-all'>
                                    Ảnh xóa chân mày
                                </div>
                                {/* NO EYEBROWS DISPLAYED HERE - Only in modal */}
                            </div>
                        </div>
                    )}
                </div>

                {openModalPreview && (
                    <ModalV3
                        onToggleSyncMode={handleToggleSyncMode}
                        showPoints={showPoints}
                        onTogglePoints={togglePoints}
                        showDrawLines={showDrawLines}
                        onToggleDrawLines={toggleDrawLines}
                        onSave={saveModalImage}
                        availableEyebrows={availableEyebrows}
                        placedBoxes={placedBoxes}
                        onDoubleClick={handleEyebrowDoubleClick}
                        showOverlayImage={showOverlayImage}
                        onToggleOverlay={toggleOverlayImage}
                    >
                        <div
                            ref={modalDropZoneRef}
                            style={{
                                // Dynamic background image based on toggle state
                                backgroundImage: showOverlayImage
                                    ? `url(${addBase64Prefix(analysisData?.output_with_eyebrows_orginal_final_b64_string)})`
                                    : `url(${addBase64Prefix(analysisData?.output_remove_eyebrows_final_b64_string)})`,
                                backgroundSize: '100% 100%',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                aspectRatio: '1/1'
                            }}
                            className='w-full h-full rounded relative transition-colors touch-none overflow-hidden'
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <canvas ref={canvasRef} className='absolute top-0 left-0 w-full h-full pointer-events-none' />
                            {/* EYEBROWS DISPLAYED ONLY IN MODAL */}
                            {placedBoxes.map((box) => {
                                const modalPosition = convertPositionFromOutsideToModal(box.position.x, box.position.y)
                                const scale = box.scale || 1
                                const scaledWidth = eyebrowSize.width * scale * (modalDropZoneWidth / 302)
                                // const scaledHeight = eyebrowSize.height * scale

                                return (
                                    <DraggableBoxV3
                                        key={box.id}
                                        id={box.id}
                                        name={box.name}
                                        image={addBase64Prefix(box.image)}
                                        x={modalPosition.x}
                                        y={modalPosition.y}
                                        flip={box.flip}
                                        width={scaledWidth}
                                        onDoubleClick={() => {
                                            const eyebrow = availableEyebrows.find((e) => box.image.includes(e.image))
                                            if (eyebrow) {
                                                handleEyebrowDoubleClick(eyebrow)
                                            }
                                        }}
                                        className={hidePlacedBoxes ? 'opacity-0' : 'opacity-100'}
                                        noBorder={false}
                                    />
                                )
                            })}
                        </div>
                    </ModalV3>
                )}

                {/* Loading Modal */}
                {isLoadingModal && (
                    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80'>
                        <div className='bg-white rounded-lg p-8 flex flex-col items-center gap-4'>
                            <div className='w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
                            <p className='text-gray-700'>Đang mở modal...</p>
                        </div>
                    </div>
                )}
            </div>
        </Fragment>
    )
}

export default FaceAnalyzerImgSet
