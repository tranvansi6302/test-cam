import { Check, Minus, Plus } from 'lucide-react'
import React, { Fragment, useEffect, useRef, useState } from 'react'

interface DraggableBoxProps {
    id: string
    name: string
    image: string
    x?: number
    y?: number
    className?: string
    flip?: boolean
    width?: number
    height?: number
    scale?: number
    onDoubleClick?: () => void
    onClick?: () => void
    onZoomIn?: () => void
    onZoomOut?: () => void
    isActive?: boolean
    noBorder?: boolean
    notActive?: boolean
}

export const DraggableBoxV3: React.FC<DraggableBoxProps> = ({
    id,
    name,
    image,
    x,
    y,
    flip = false,
    width = '140',
    height = 'auto',
    scale = 1,
    onDoubleClick,

    onZoomIn,
    onZoomOut,
    isActive = false,
    className = '',
    noBorder = false,
    notActive = false
}) => {
    const boxRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [offset, setOffset] = useState({ x: 0, y: 0 })
    const [lastTap, setLastTap] = useState<{ time: number; x: number; y: number } | null>(null)

    // Thời gian tối đa giữa hai lần chạm để coi là nhấp đúp (ms)
    const DOUBLE_TAP_THRESHOLD = 300
    // Khoảng cách tối đa giữa hai lần chạm (px)
    const DOUBLE_TAP_DISTANCE = 30

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const offsetX = e.clientX - rect.left
        const offsetY = e.clientY - rect.top
        setOffset({ x: offsetX, y: offsetY })
        setIsDragging(true)
        const customEvent = new CustomEvent('box-drag-start', {
            bubbles: true,
            detail: { id, name, image, offsetX, offsetY, flip }
        })
        document.dispatchEvent(customEvent)

        const dragImage = new Image()
        dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
        e.dataTransfer.setDragImage(dragImage, 0, 0)

        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        if (e.clientX !== 0 && e.clientY !== 0) {
            const customEvent = new CustomEvent('box-drag-move', {
                bubbles: true,
                detail: {
                    id,
                    name,
                    image,
                    clientX: e.clientX,
                    clientY: e.clientY,
                    offsetX: offset.x,
                    offsetY: offset.y,
                    flip
                }
            })
            document.dispatchEvent(customEvent)
        }
    }

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        setIsDragging(false)
        const customEvent = new CustomEvent('box-drag-end', {
            bubbles: true,
            detail: {
                id,
                name,
                image,
                clientX: e.clientX,
                clientY: e.clientY,
                offsetX: offset.x,
                offsetY: offset.y,
                flip
            }
        })
        document.dispatchEvent(customEvent)
    }

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        const touch = e.touches[0]
        const rect = e.currentTarget.getBoundingClientRect()
        const offsetX = touch.clientX - rect.left
        const offsetY = touch.clientY - rect.top
        setOffset({ x: offsetX, y: offsetY })
        setIsDragging(true)

        // Xử lý nhấp đúp trên di động
        const now = Date.now()
        const tapX = touch.clientX
        const tapY = touch.clientY

        if (lastTap) {
            const timeDiff = now - lastTap.time
            const distance = Math.sqrt(Math.pow(tapX - lastTap.x, 2) + Math.pow(tapY - lastTap.y, 2))

            if (timeDiff < DOUBLE_TAP_THRESHOLD && distance < DOUBLE_TAP_DISTANCE) {
                // Nhấp đúp được phát hiện
                if (onDoubleClick) {
                    onDoubleClick()
                }
                setLastTap(null) // Reset để tránh phát hiện nhầm
            } else {
                setLastTap({ time: now, x: tapX, y: tapY })
            }
        } else {
            setLastTap({ time: now, x: tapX, y: tapY })
        }

        const customEvent = new CustomEvent('box-touch-start', {
            bubbles: true,
            detail: { id, name, image, offsetX, offsetY, flip, clientX: touch.clientX, clientY: touch.clientY }
        })
        document.dispatchEvent(customEvent)
    }

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (isDragging) {
            const touch = e.touches[0]
            const customEvent = new CustomEvent('box-touch-move', {
                bubbles: true,
                detail: {
                    id,
                    name,
                    image,
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                    offsetX: offset.x,
                    offsetY: offset.y,
                    flip
                }
            })
            document.dispatchEvent(customEvent)
        }
    }

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        if (isDragging) {
            setIsDragging(false)
            const touch = e.changedTouches[0]
            const customEvent = new CustomEvent('box-touch-end', {
                bubbles: true,
                detail: {
                    id,
                    name,
                    image,
                    offsetX: offset.x,
                    offsetY: offset.y,
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                    flip
                }
            })
            document.dispatchEvent(customEvent)
        }
    }

    // Add event listeners for optimized touch handling
    useEffect(() => {
        if (!boxRef.current) return

        // Use a non-passive touch handler at the document level to prevent scrolling
        const preventScroll = (e: TouchEvent) => {
            if (isDragging && e.target && boxRef.current?.contains(e.target as Node)) {
                e.preventDefault()
            }
        }

        // Add the event listener to document to ensure it's captured properly
        document.addEventListener('touchmove', preventScroll, { passive: false })

        return () => {
            document.removeEventListener('touchmove', preventScroll)
        }
    }, [isDragging])

    // Reset lastTap sau một khoảng thời gian nếu không có nhấp đúp
    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>
        if (lastTap) {
            timeout = setTimeout(() => {
                setLastTap(null)
            }, DOUBLE_TAP_THRESHOLD)
        }
        return () => clearTimeout(timeout)
    }, [lastTap, DOUBLE_TAP_THRESHOLD])

    return (
        <div
            ref={boxRef}
            className={`flex items-center justify-center cursor-move select-none ${
                x !== undefined && y !== undefined ? 'absolute' : ''
            } touch-none ${className}`}
            style={{
                left: x,
                top: y,
                transform: flip ? 'scaleX(-1)' : 'none',
                willChange: isDragging ? 'transform' : 'auto',
                // padding: isActive ? '10px' : '0px',
                borderRadius: isActive || notActive ? '4px' : '0px',
                border: noBorder
                    ? 'none !important'
                    : isActive
                    ? '1px solid oklch(72.3% 0.219 149.579)'
                    : notActive
                    ? '1px solid #e7e7e7'
                    : '1px solid transparent'
            }}
            draggable='true'
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onDoubleClick={onDoubleClick}
            onClick={(e) => {
                e.stopPropagation()
                e.preventDefault() // Prevent any default browser behavior
                if (onDoubleClick) onDoubleClick()
            }}
        >
            {image ? (
                <Fragment>
                    <img
                        style={{
                            // aspectRatio: 619 / 212,
                            width: `${width}px`,
                            height: `${height}px`
                        }}
                        src={image}
                        alt={name}
                        draggable='false'
                    />
                    {isActive && (
                        <button className=' rounded-full bg-green-500 translate-x-[10px]'>
                            <Check fontSize={'10px'} color='white' />
                        </button>
                    )}
                </Fragment>
            ) : (
                <div className='w-full h-full bg-blue-500 flex items-center justify-center text-white'>{name}</div>
            )}

            {/* Zoom Controls - chỉ hiển thị khi isActive */}
            {isActive && (
                <div className='absolute -top-10 left-1/2 transform -translate-x-1/2 flex gap-1 bg-white rounded-md shadow-lg border p-1'>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            if (onZoomOut) onZoomOut()
                        }}
                        className='w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-600 text-xs'
                        title='Thu nhỏ'
                    >
                        <Minus size={12} />
                    </button>
                    <span className='px-2 py-1 text-xs font-medium text-gray-700'>{Math.round(scale * 100)}%</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            if (onZoomIn) onZoomIn()
                        }}
                        className='w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-gray-600 text-xs'
                        title='Phóng to'
                    >
                        <Plus size={12} />
                    </button>
                </div>
            )}
        </div>
    )
}
