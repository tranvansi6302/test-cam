/* eslint-disable react-hooks/exhaustive-deps */
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Settings2 } from 'lucide-react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { beautyApi } from '../../apis/beauty.api'
import AILoadingOverlay from '../../components/ai-loading-overlay'
import AppHeader from '../../components/app-header'

import ModalCustomer from '../../components/modal-customer'
import SectionTitle from '../../components/section-title'
import { DEFAULT_CONFIG_ADJUSTMENT, DEFAULT_LEFT_PARAMS, DEFAULT_RIGHT_PARAMS } from '../../configs/ai.config'
import useBreakpoint from '../../hooks/use-breakpoint'
import { useAnalysisStore } from '../../stores/analysis.store'
import { useEyebrowListStore } from '../../stores/eyebrown.store'
import { useModalStore } from '../../stores/modal.store'
import { AdjustmentResponseType, Config } from '../../types/types'
import { convertImageUrlToBase64 } from '../../utils/convert'
import http from '../../utils/http'
import Controls from './_components/controls/controls'
import { EyebrowList } from './_components/eyebrow-list'
import KnobContainer from './_components/knob/knob-container'
import FaceTypeSection from './_components/result-analyzer/face-analyzer-content'
import FaceAnalyzerImgSet, { PlacedBox, Position } from './_components/result-analyzer/face-analyzer-img'
import { EyebrowDialog, FaceShapeDialog } from './_components/result-analyzer/modal-analyzer-face'
import { ORIGINAL_EYEBROW } from './config'
import { Eyebrow } from './eyebrow-store'
/**
 * Main component for facial adjustment page with temporary data
 */

export interface FaceParamType {
    goldenRatio: number | undefined
    userRatio: number | undefined
    accuracy: number | undefined
}

function AIFaceAnalyzer() {
    const breakpoints = useBreakpoint()
    const {
        setAnalysisData,
        setIsCallParamChange,
        isCallParamChange,
        setEyebrowList,
        eyebrowList,
        setEyesBrows,
        eyesBrows,
        analysisData
    } = useAnalysisStore()
    const { setOpenModalPreview } = useModalStore()
    const { setBase64RemoveEyebrow, setBase64WithEyebrow } = useEyebrowListStore()
    // Get id and get image
    const [searchParams] = useSearchParams()
    const faceId = searchParams.get('faceId')
    const navigate = useNavigate()

    const [showCustomerModal, setShowCustomerModal] = useState(false)
    const [isLoadingModal, setIsLoadingModal] = useState(false)
    const [isFirstTimeApply, setIsFirstTimeApply] = useState(true)

    /**
     * Thông số khuôn mặt faceParam
     * - Tỷ lệ vàng => goldenRatio
     * - Tỷ lệ người dùng => userRatio
     * - Độ chính xác => accuracy
     */
    const [faceParam, setFaceParam] = useState<FaceParamType>({
        goldenRatio: undefined,
        userRatio: undefined,
        accuracy: undefined
    })

    const [showAnimation, setShowAnimation] = useState(false)

    // Dialog states
    const [showFaceShapeDialog, setShowFaceShapeDialog] = useState(false)
    const [showEyebrowDialog, setShowEyebrowDialog] = useState(false)

    // Modal functionality states
    const [savedPosition, setSavedPosition] = useState<Position | null>(null)
    const [placedBoxes, setPlacedBoxes] = useState<PlacedBox[]>([])
    const [dropZoneWidth, setDropZoneWidth] = useState(0)
    const [dropZoneHeight, setDropZoneHeight] = useState(0)

    const [eyebrowSize, setEyebrowSize] = useState({
        width: ORIGINAL_EYEBROW.width,
        height: ORIGINAL_EYEBROW.height
    })

    // Get face ai
    const { data: faceAI, refetch: refetchFaceAI } = useQuery({
        queryKey: ['getFaceAI', faceId],
        queryFn: () => beautyApi.getFaceAIById(faceId ?? ''),
        enabled: !!faceId
    })

    useEffect(() => {
        if (!faceId) {
            navigate('/ai-face-analyzer-list')
        }
    }, [faceId, faceAI, navigate])

    /**
     * Gọi API với thông số mới từ controls
     */
    const callApiWithNewParams = async (config: Config) => {
        setIsCallParamChange(true)
        setShowAnimation(false)
        try {
            let base64Image = ''
            try {
                // Check if the input is a URL (not already base64)
                if (faceAI?.data?.data.facePhotoSource.startsWith('http')) {
                    base64Image = await convertImageUrlToBase64(faceAI?.data?.data.facePhotoSource)
                }
            } catch (error) {
                console.error('Error converting image URL to base64:', error)
                setIsCallParamChange(false)

                return
            }

            // Tạo dữ liệu cho API request với thông số từ controls default
            const requestData = {
                input_image: base64Image,
                eyebrow_left_path: config.eyebrow_left_path,
                apply_makeup: config.apply_makeup,
                remove_eyebrows: config.remove_eyebrows,
                definition: config.definition,
                color_eyebrow: config.color_eyebrow,
                show_landmarks: config.show_landmarks,
                adjust_params: config.adjust_params,
                is_male: searchParams.get('is_male') !== 'false'
            }

            // Gọi API
            const response = await http.face.post('', requestData)

            // Cập nhật dữ liệu phân tích
            const data: AdjustmentResponseType = response.data
            setAnalysisData(data)
            const eyebrowList: Eyebrow[] = [
                {
                    id: 'eyebrow1',
                    name: 'Chân mày 1',
                    // Gắn tạm chân mày test vào đây, sau này sẽ lấy từ API
                    image: data.eyebrow_1 ?? ''
                    // image: cmTest
                },
                {
                    id: 'eyebrow2',
                    name: 'Chân mày 2',
                    image: data.eyebrow_2 ?? ''
                }
            ]
            setEyebrowList(eyebrowList)
            setEyesBrows(data.eyes_brows)
            // Cập nhật các giá trị hiển thị
            const goldenRatioValue = parseFloat(data.golden_face_ratio || '0')
            const userRatioValue = parseFloat(data.your_face_ratio || '0')

            // Kiểm tra và định dạng giá trị độ chính xác
            let accuracyValue = 0
            if (typeof data.golden_ratio_match_percentage === 'number') {
                accuracyValue = data.golden_ratio_match_percentage
            } else if (typeof data.golden_ratio_match_percentage === 'string') {
                // Nếu là chuỗi, chuyển thành số
                const percentStr = data.golden_ratio_match_percentage as string
                accuracyValue = parseFloat(percentStr.replace('%', ''))
            }

            setFaceParam({
                goldenRatio: goldenRatioValue,
                userRatio: userRatioValue,
                accuracy: accuracyValue
            })

            const hasValidMetrics = goldenRatioValue > 0 && userRatioValue > 0 && accuracyValue > 0

            if (hasValidMetrics) {
                // Hiển thị animation sau khi nhận dữ liệu
                setShowAnimation(true)
            } else {
                setAnalysisData(null as unknown as AdjustmentResponseType)
            }
        } catch (error) {
            console.error('Error calling API with new parameters:', error)
            setIsCallParamChange(false)
            setShowAnimation(false)
            setEyebrowList([])
        } finally {
            setIsCallParamChange(false)
            setShowAnimation(false)
        }
    }
    const handleParamChange = (config: Config) => {
        callApiWithNewParams(config)
    }

    const handleOpenFormCustomers = async () => {
        try {
            if (faceId) {
                await refetchFaceAI()
            }
        } catch {
            // proceed to open even if refetch fails
        } finally {
            setShowCustomerModal(true)
        }
    }

    // Guard to ensure heavy analysis is only run once per page load
    const hasInitializedAnalysisRef = useRef(false)

    /**
     * Khởi tạo và tải dữ liệu hình ảnh (chỉ 1 lần)
     */
    useEffect(() => {
        if (hasInitializedAnalysisRef.current) return
        if (faceAI?.data?.data.facePhotoSource) {
            hasInitializedAnalysisRef.current = true
            const initialConfig = {
                input_image: DEFAULT_CONFIG_ADJUSTMENT.INPUT_IMAGE,
                eyebrow_left_path: DEFAULT_CONFIG_ADJUSTMENT.EYEBROW_LEFT_PATH,
                apply_makeup: DEFAULT_CONFIG_ADJUSTMENT.APPLY_MAKEUP,
                show_landmarks: DEFAULT_CONFIG_ADJUSTMENT.SHOW_LANDMARKS,
                definition: DEFAULT_CONFIG_ADJUSTMENT.DEFINITION,
                color_eyebrow: DEFAULT_CONFIG_ADJUSTMENT.COLOR_EYEBROW,
                remove_eyebrows: DEFAULT_CONFIG_ADJUSTMENT.REMOVE_EYEBROWS,
                adjust_params: {
                    left: {
                        ...DEFAULT_LEFT_PARAMS
                    },
                    right: {
                        ...DEFAULT_RIGHT_PARAMS
                    }
                }
            }
            callApiWithNewParams(initialConfig)
        }
    }, [faceAI])

    // After closing the save modal, force-refresh face details without re-triggering analysis
    useEffect(() => {
        if (!showCustomerModal && faceId) {
            refetchFaceAI()
        }
    }, [showCustomerModal, faceId, refetchFaceAI])

    // This function is now handled within the component itself in sync mode

    // Helper function to calculate eyebrow bounds
    const calculateEyebrowBounds = (points: number[][]) => {
        if (!points || points.length === 0) return null

        let minX = Infinity
        let minY = Infinity
        let maxX = -Infinity
        let maxY = -Infinity

        points.forEach(([x, y]) => {
            minX = Math.min(minX, x)
            minY = Math.min(minY, y)
            maxX = Math.max(maxX, x)
            maxY = Math.max(maxY, y)
        })

        return {
            left: minX,
            top: minY,
            width: maxX - minX,
            height: maxY - minY
        }
    }

    const handleDoubleClick = (eyebrow: Eyebrow) => {
        // Process eyebrow positioning first
        if (eyesBrows) {
            const leftPoints: number[][] = []
            eyesBrows.pts_up_left_brows.forEach((point) => leftPoints.push(point))
            eyesBrows.pts_down_left_brows.forEach((point) => leftPoints.push(point))
            const leftBounds = calculateEyebrowBounds(leftPoints)

            const rightPoints: number[][] = []
            eyesBrows.pts_up_right_brows.forEach((point) => rightPoints.push(point))
            eyesBrows.pts_down_right_brows.forEach((point) => rightPoints.push(point))
            const rightBounds = calculateEyebrowBounds(rightPoints)

            if (leftBounds && rightBounds) {
                const leftId = `${eyebrow.id}-left`
                const rightId = `${eyebrow.id}-right`

                const originalLeftWidth = leftBounds.width
                const originalLeftHeight = leftBounds.height
                const originalRightWidth = rightBounds.width
                const originalRightHeight = rightBounds.height

                const originalImageWidth = 1028
                const originalImageHeight = 1028

                const baseline = 302

                const scaledLeftWidth = (originalLeftWidth / originalImageWidth) * baseline
                const scaledLeftHeight = (originalLeftHeight / originalImageHeight) * baseline
                const scaledRightWidth = (originalRightWidth / originalImageWidth) * baseline
                const scaledRightHeight = (originalRightHeight / originalImageHeight) * baseline

                const newEyebrowSize = {
                    width: Math.max(scaledLeftWidth, scaledRightWidth),
                    height: Math.max(scaledLeftHeight, scaledRightHeight)
                }

                const leftFrameWidth = Math.max((leftBounds.width / 1028) * baseline, newEyebrowSize.width)
                const leftFrameHeight = Math.max((leftBounds.height / 1028) * baseline, newEyebrowSize.height)
                const rightFrameWidth = Math.max((rightBounds.width / 1028) * baseline, newEyebrowSize.width)
                const rightFrameHeight = Math.max((rightBounds.height / 1028) * baseline, newEyebrowSize.height)

                // Define eyebrow size relative to 302 baseline using a small 1.1 multiplier
                const eyebrowMultiplier = 1.1
                const eyebrowWidth = rightFrameWidth * eyebrowMultiplier
                const eyebrowHeight = rightFrameHeight * eyebrowMultiplier

                // Position the eyebrows using a mathematical centering formula
                const leftPosition = {
                    x:
                        (leftBounds.left / 1028) * baseline -
                        (eyebrowWidth - leftFrameWidth) / 2 -
                        8,
                    y:
                        (leftBounds.top / 1028) * baseline -
                        (eyebrowHeight - leftFrameHeight) / 2 -
                        3
                }

                const rightPosition = {
                    x:
                        (rightBounds.left / 1028) * baseline -
                        (eyebrowWidth - rightFrameWidth) / 2 +
                        8,
                    y:
                        (rightBounds.top / 1028) * baseline -
                        (eyebrowHeight - rightFrameHeight) / 2 -
                        3
                }

                const newBoxes: PlacedBox[] = [
                    {
                        id: leftId,
                        name: eyebrow.name,
                        image: eyebrow.image,
                        position: leftPosition,
                        originalPosition: leftPosition, // Lưu vị trí ban đầu
                        flip: false,
                        scale: 1, // Scale mặc định
                        anchorPoint: leftPosition // Inner corner của chân mày trái
                    },
                    {
                        id: rightId,
                        name: eyebrow.name,
                        image: eyebrow.image,
                        position: rightPosition,
                        originalPosition: rightPosition, // Lưu vị trí ban đầu
                        flip: true,
                        scale: 1, // Scale mặc định
                        anchorPoint: {
                            // Inner corner của chân mày phải (do flip)
                            x: rightPosition.x + eyebrowWidth * 0.2,
                            y: rightPosition.y
                        }
                    }
                ]

                setPlacedBoxes(newBoxes)
                setSavedPosition(leftPosition)
                setEyebrowSize({
                    width: eyebrowWidth,
                    height: eyebrowHeight
                })
            }
        }

        // Handle modal opening with loading state
        if (isFirstTimeApply) {
            // Show loading modal for first time only
            setIsLoadingModal(true)

            setTimeout(() => {
                setIsLoadingModal(false)
                setIsFirstTimeApply(false) // Mark as no longer first time
                setOpenModalPreview(true)
            }, 2000) // Reduced to 2 seconds for better UX
        } else {
            // Open modal immediately for subsequent times
            setOpenModalPreview(true)
        }
    }

    // Create auto-save function
    const handleAutoSave = () => {
        if (
            !analysisData?.output_remove_eyebrows_final_b64_string ||
            !analysisData?.output_with_eyebrows_orginal_final_b64_string
        ) {
            return
        }

        try {
            const canvasWidth = 302
            const canvasHeight = 302

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

                    const backgroundImg = new Image()
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
                            const scaleX = canvasWidth / 302
                            const scaleY = canvasHeight / 302
                            const eyebrowPromises = placedBoxes.map((box) => {
                                return new Promise<void>((resolve) => {
                                    const img = new Image()
                                    img.crossOrigin = 'anonymous'

                                    img.onload = () => {
                                        // Convert position and size from outside to canvas using the same ratio
                                        const modalX = box.position.x * scaleX
                                        const modalY = box.position.y * scaleY
                                        const scale = box.scale || 1
                                        // Keep the same on-canvas size as in modal to ensure parity
                                        const scaledWidth = eyebrowSize.width * scale * (canvasWidth / 302)
                                        const scaledHeight = scaledWidth * (img.height / img.width)

                                        // Apply same letterbox offsets
                                        const drawX = modalX + offsetX
                                        const drawY = modalY + offsetY

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

                                    img.src = box.image.startsWith('data:') ? box.image : `data:image/jpeg;base64,${box.image}`
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
            const removeEyebrowSrc = `data:image/jpeg;base64,${analysisData.output_remove_eyebrows_final_b64_string}`

            const withEyebrowSrc = `data:image/jpeg;base64,${analysisData.output_with_eyebrows_orginal_final_b64_string}`

            Promise.all([createEyebrowImage(removeEyebrowSrc), createEyebrowImage(withEyebrowSrc)])
                .then(([removeEyebrowImage, withEyebrowImage]) => {
                    setBase64RemoveEyebrow(removeEyebrowImage)
                    setBase64WithEyebrow(withEyebrowImage)
                })
                .catch((error) => {
                    console.error('Error creating eyebrow images:', error)
                })
        } catch (error) {
            console.error('Error in auto-save:', error)
        }
    }

    // Auto-apply first eyebrow when data is ready
    useEffect(() => {
        if (
            eyebrowList &&
            eyebrowList.length > 0 &&
            eyesBrows &&
            dropZoneWidth > 0 &&
            dropZoneHeight > 0 &&
            placedBoxes.length === 0 &&
            isFirstTimeApply // Only auto-apply when it's first time
        ) {
            // Apply first eyebrow automatically on first load
            handleDoubleClick(eyebrowList[0])
        }
    }, [eyebrowList, eyesBrows, dropZoneWidth, dropZoneHeight, placedBoxes.length, isFirstTimeApply])

    return (
        <Fragment>
            <AppHeader />
            <ModalCustomer
                visible={showCustomerModal}
                onHide={() => setShowCustomerModal(false)}
                onSave={() => {
                    if (faceId) {
                        refetchFaceAI()
                    }
                }}
                customerId={faceAI?.data?.data?.customerId || faceAI?.data?.data?.customer?.id}
                disableNavigate
            />

            {/* Sticky Header Bar - 100% Viewport width, touching left/right of screen */}
            <div className='sticky top-0 z-[40] bg-white/85 backdrop-blur-md border-b border-slate-100 py-1.5 max-sm:py-1 transition-all w-full shadow-sm'>
                <div className='max-w-[1350px] mx-auto px-4 max-sm:px-2 flex justify-between w-full items-center'>
                    <Link to='/ai-face-analyzer-list' className='flex items-center gap-1 text-slate-500 hover:text-pink-500 transition-colors text-[11px] sm:text-xs font-semibold select-none'>
                        <ArrowLeft className='w-3.5 h-3.5' />
                        Quay về danh sách
                    </Link>
                    <button
                        className='
    group relative overflow-hidden px-2.5 py-1 text-[11px] sm:text-xs rounded-[4px] font-semibold
    bg-gradient-to-r from-pink-500 to-pink-600 text-white 
    border border-pink-400/30 backdrop-blur-sm
    hover:from-pink-600 hover:to-pink-700 hover:scale-105
    transition-all duration-300 ease-in-out transform
    flex items-center gap-1.5 shadow-lg shadow-pink-500/25
    pink-glow
  '
                        onClick={handleOpenFormCustomers}
                    >
                        <svg
                            className='w-3.5 h-3.5 transform group-hover:rotate-12 transition-transform duration-300'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4'
                            />
                        </svg>
                        <span className='relative z-10'>Lưu thông tin</span>
                        <div
                            className='
    absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
    translate-x-[-150%] group-hover:translate-x-[150%] 
    transition-transform duration-500 ease-out
    skew-x-[-20deg]
  '
                        ></div>
                        <div
                            className='
    absolute inset-0 bg-pink-400/20 opacity-0 group-hover:opacity-100
    transition-opacity duration-300
  '
                        ></div>
                    </button>
                </div>
            </div>

            <main className='w-full max-w-[1350px] mx-auto px-4 max-sm:px-2 mt-1 pb-[60px]'>
                <div className='flex flex-col gap-5 lg:flex-row items-start'>
                    {/* Left side: Face information */}
                    <div className='w-full lg:w-[80%]'>
                        <FaceAnalyzerImgSet
                            availableEyebrows={eyebrowList ?? []}
                            placedBoxes={placedBoxes}
                            setPlacedBoxes={setPlacedBoxes}
                            onDoubleClick={handleDoubleClick}
                            savedPosition={savedPosition}
                            setSavedPosition={setSavedPosition}
                            dropZoneWidth={dropZoneWidth}
                            setDropZoneWidth={setDropZoneWidth}
                            dropZoneHeight={dropZoneHeight}
                            setDropZoneHeight={setDropZoneHeight}
                            eyebrowSize={eyebrowSize}
                            setEyebrowSize={setEyebrowSize}
                            onAutoSave={handleAutoSave}
                        />
                        {/* Chân mày apply trên mobile */}
                        {!breakpoints.desktop && !breakpoints.tabletLandscape && (
                            <div className='w-full flex mt-3 gap-4 border border-dashed border-[#e7e7e7] rounded-md p-2'>
                                <div className='m-0 mb-2 text-[13px] text-[#666] flex items-center gap-2'>
                                    <span>Chân mày đề xuất</span>
                                </div>
                                <EyebrowList
                                    placedBoxes={placedBoxes}
                                    availableEyebrows={eyebrowList ?? []}
                                    handleDoubleClick={handleDoubleClick}
                                />
                            </div>
                        )}
                        <div className='flex items-center justify-between my-3 relative'>
                            <SectionTitle>Kết quả sau khi phân tích</SectionTitle>
                        </div>
                        <KnobContainer isLoading={isCallParamChange} faceParam={faceParam} showAnimation={showAnimation} />
                        <FaceTypeSection
                            onShowFaceShapeDialog={() => setShowFaceShapeDialog(true)}
                            onShowEyebrowDialog={() => setShowEyebrowDialog(true)}
                        />{' '}
                    </div>
                    {/* Right side: Controls */}
                    <div className='hidden lg:block lg:w-[20%]  border border-dashed border-[#a9a9a9] rounded-[4px] p-2 lg:mt-[45px]'>
                        <div className='mb-6 flex items-center gap-2'>
                            <SectionTitle icon={<Settings2 size={16} className='text-[#505050]' />}>Tùy chỉnh</SectionTitle>
                        </div>
                        <Controls
                            onParamChange={handleParamChange}
                            onDoubleClick={handleDoubleClick}
                            availableEyebrows={eyebrowList ?? []}
                            placedBoxes={placedBoxes}
                        />
                    </div>
                </div>
            </main>
            {/* Dialogs */}
            <FaceShapeDialog visible={showFaceShapeDialog} onHide={() => setShowFaceShapeDialog(false)} />
            <EyebrowDialog visible={showEyebrowDialog} onHide={() => setShowEyebrowDialog(false)} />
            <AILoadingOverlay
                message={isCallParamChange ? 'Đang phân tích...' : 'Đang xử lý chân mày...'}
                subMessage={isCallParamChange ? 'AI đang xử lý khuôn mặt của bạn...' : 'Đang áp dụng thay đổi...'}
            />
            {/* Loading Modal for eyebrow positioning */}
            {isLoadingModal && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80'>
                    <div className='bg-white rounded-lg p-8 flex flex-col items-center gap-4'>
                        <div className='w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
                        <p className='text-gray-700'>Đang áp dụng chân mày...</p>
                    </div>
                </div>
            )}
        </Fragment>
    )
}

export default AIFaceAnalyzer
