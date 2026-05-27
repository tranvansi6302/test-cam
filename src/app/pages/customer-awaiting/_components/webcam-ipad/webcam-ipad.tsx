/* eslint-disable react-hooks/exhaustive-deps */
import { ArrowLeft, Camera, Check, SwitchCamera, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import './webcam-ipad.css'
import { useMutation } from '@tanstack/react-query'
import { UpdateFacePhotoEyebrowFinishedRequest } from '../../../../types/beauty.type'
import { beautyApi } from '../../../../apis/beauty.api'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { queryClient } from '../../../../../main'

export default function WebcamIpad() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const faceId = searchParams.get('faceId')
    const [hasPhoto, setHasPhoto] = useState<boolean>(false)
    const [photoData, setPhotoData] = useState<string | null>(null)
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [isMobile, setIsMobile] = useState<boolean>(false)
    const [aspectRatio, setAspectRatio] = useState<number>(4 / 3) // Standard aspect ratio
    const [cameraActive, setCameraActive] = useState<boolean>(false)
    const [isLandscapeTablet, setIsLandscapeTablet] = useState<boolean>(false)

    useEffect(() => {
        // Check if mobile or tablet portrait
        const checkDeviceOrientation = () => {
            const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
            const isLandscape = window.innerWidth > window.innerHeight

            setIsMobile(window.innerWidth < 1024)
            setIsLandscapeTablet(isTablet && isLandscape)
        }

        // Initial check
        checkDeviceOrientation()

        // Add resize event listener
        window.addEventListener('resize', checkDeviceOrientation)

        // Initialize camera
        getVideo()

        // Cleanup function - ensure camera is always stopped when component unmounts
        return () => {
            window.removeEventListener('resize', checkDeviceOrientation)
            const video = videoRef.current
            if (video && video.srcObject) {
                const tracks = (video.srcObject as MediaStream).getTracks()
                tracks.forEach((track) => {
                    if (track.readyState === 'live') {
                        track.stop()
                    }
                })
                video.srcObject = null
                setCameraActive(false)
            }
        }
    }, [])

    // Effect to change camera when facingMode changes
    useEffect(() => {
        getVideo()
    }, [facingMode])

    const getVideo = async () => {
        try {
            const video = videoRef.current
            if (!video) return

            // Indicate camera is initializing
            setCameraActive(false)

            // Stop any existing streams
            if (video.srcObject) {
                const tracks = (video.srcObject as MediaStream).getTracks()
                tracks.forEach((track) => track.stop())
            }

            // Get the best video constraints for the device
            const constraints = {
                video: {
                    facingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    aspectRatio: { ideal: aspectRatio }
                },
                audio: false
            }

            const stream = await navigator.mediaDevices.getUserMedia(constraints)

            // Update aspect ratio based on actual stream
            const videoTrack = stream.getVideoTracks()[0]
            const settings = videoTrack.getSettings()

            if (settings.width && settings.height) {
                setAspectRatio(settings.width / settings.height)
            }

            video.srcObject = stream
            video.play().then(() => {
                setCameraActive(true)
            })
        } catch (err) {
            console.error('Error accessing camera:', err)
            setCameraActive(false)
        }
    }

    const switchCamera = () => {
        setFacingMode((prevMode) => (prevMode === 'user' ? 'environment' : 'user'))
    }

    const takePhoto = () => {
        const video = videoRef.current
        const canvas = canvasRef.current

        if (!video || !canvas) return

        const width = video.videoWidth
        const height = video.videoHeight

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (ctx) {
            // If using front camera, flip the image horizontally to fix the mirroring
            if (facingMode === 'user') {
                ctx.translate(width, 0)
                ctx.scale(-1, 1)
            }

            ctx.drawImage(video, 0, 0, width, height)

            // If the image was flipped, restore the context
            if (facingMode === 'user') {
                ctx.setTransform(1, 0, 0, 1, 0, 0)
            }

            const imgData = canvas.toDataURL('image/jpeg', 1.0)
            setPhotoData(imgData)
            setHasPhoto(true)
            console.log('Captured image base64:', imgData)
        }
    }

    const closePhoto = () => {
        setHasPhoto(false)
        setPhotoData(null)
        // Reinitialize camera after closing photo
        setTimeout(() => {
            getVideo()
        }, 100)
    }

    // Update ai face
    const updateFacePhotoEyebrowFinishedMutation = useMutation({
        mutationFn: (body: UpdateFacePhotoEyebrowFinishedRequest) => beautyApi.updateFacePhotoEyebrowFinished(body)
    })

    const confirmPhoto = () => {
        // Handle confirm photo logic here
        const finalBase64 = photoData?.split(',')[1]
        if (!finalBase64) return
        updateFacePhotoEyebrowFinishedMutation.mutate(
            {
                id: Number(faceId),
                facePhotoEyebrowFinishedBase64: finalBase64,
                isActived: 2
            },
            {
                onSuccess: () => {
                    toast.success('Cập nhật ảnh thành công')
                    // Turn off camera before navigating
                    const video = videoRef.current
                    if (video && video.srcObject) {
                        const tracks = (video.srcObject as MediaStream).getTracks()
                        tracks.forEach((track) => track.stop())
                        setCameraActive(false)
                    }
                    queryClient.invalidateQueries({ queryKey: ['AI_FACE_LIST'] })
                    navigate('/ai-face-analyzer-list')
                },
                onError: () => {
                    toast.error('Cập nhật ảnh thất bại')
                }
            }
        )
    }

    const exitCamera = () => {
        const video = videoRef.current
        if (video && video.srcObject) {
            const tracks = (video.srcObject as MediaStream).getTracks()
            tracks.forEach((track) => {
                if (track.readyState === 'live') {
                    track.stop()
                }
            })
            video.srcObject = null
            setCameraActive(false)
        }
        queryClient.invalidateQueries({ queryKey: ['AI_FACE_LIST'] })
        navigate('/ai-face-analyzer-list')
    }

    return (
        <div className='ipad-cam-webcam-container'>
            <div className='ipad-cam-video-container'>
                {!hasPhoto ? (
                    <video
                        ref={videoRef}
                        className='ipad-cam-video'
                        style={{
                            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                            objectFit: 'contain'
                        }}
                    ></video>
                ) : (
                    <div className='ipad-cam-photo-preview'>{photoData && <img src={photoData} alt='Captured' />}</div>
                )}
                <canvas className='ipad-cam-canvas' ref={canvasRef} style={{ display: 'none' }}></canvas>
            </div>

            <div className={`ipad-cam-header-controls ${isLandscapeTablet ? 'ipad-cam-landscape-tablet' : ''}`}>
                <button className='ipad-cam-back-btn' onClick={exitCamera} title='Quay lại'>
                    <ArrowLeft size={20} />
                    <span>Quay lại</span>
                </button>

                {cameraActive && !hasPhoto && (
                    <div className='ipad-cam-camera-status'>{facingMode === 'user' ? 'Camera trước' : 'Camera sau'}</div>
                )}
            </div>

            <div className={`ipad-cam-controls-container ${isMobile ? 'ipad-cam-mobile' : 'ipad-cam-desktop'}`}>
                {!hasPhoto ? (
                    <>
                        <button className='ipad-cam-control-btn ipad-cam-capture-btn' onClick={takePhoto} title='Chụp ảnh'>
                            <Camera size={32} />
                        </button>
                        <button className='ipad-cam-control-btn ipad-cam-switch-btn' onClick={switchCamera} title='Đổi camera'>
                            <SwitchCamera size={24} />
                        </button>
                    </>
                ) : (
                    <div className='ipad-cam-photo-action-buttons'>
                        <button className='ipad-cam-control-btn ipad-cam-confirm-btn' onClick={confirmPhoto} title='Xác nhận'>
                            <Check size={32} />
                        </button>
                        <button className='ipad-cam-control-btn ipad-cam-close-btn' onClick={closePhoto} title='Quay lại'>
                            <X size={32} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
