import React, { useState } from 'react'
import { useModalStore } from '../../../../../stores/modal.store'
import { EyebrowList } from '../../eyebrow-list'
import { Eyebrow } from '../../../eyebrow-store'

interface PlacedBox {
    id: string
    name: string
    image: string
    position: { x: number; y: number }
    flip?: boolean
    originalPosition?: { x: number; y: number }
    scale?: number
    anchorPoint?: { x: number; y: number }
}

interface ModalProps {
    children: React.ReactNode
    onToggleSyncMode?: () => void
    showPoints?: boolean
    onTogglePoints?: () => void
    showDrawLines?: boolean
    onToggleDrawLines?: () => void
    onSave?: () => void
    availableEyebrows?: Eyebrow[]
    placedBoxes?: PlacedBox[]
    onDoubleClick?: (eyebrow: Eyebrow) => void
    showOverlayImage?: boolean
    onToggleOverlay?: () => void
}

export const ModalV3: React.FC<ModalProps> = ({
    children,
    onToggleSyncMode,
    showPoints,
    onTogglePoints,
    showDrawLines,
    onToggleDrawLines,
    onSave,
    availableEyebrows = [],
    placedBoxes = [],
    onDoubleClick,
    showOverlayImage = false,
    onToggleOverlay
}) => {
    const { syncMode } = useModalStore()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const handleSave = () => {
        if (onSave) {
            onSave()
        }
    }

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/80'>
            <div className='absolute right-4 top-4 z-99 flex gap-3'>
                {onTogglePoints && (
                    <button
                        className={`
                            group relative overflow-hidden px-4 py-1.5 text-[12px] rounded-sm text-sm font-medium
                            transition-all duration-300 ease-in-out transform hover:scale-105
                            flex items-center gap-2 backdrop-blur-sm border
                            ${
                                showPoints
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400/30 shadow-lg shadow-blue-500/25'
                                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/30'
                            }
                        `}
                        onClick={onTogglePoints}
                    >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d={
                                    showPoints
                                        ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21'
                                        : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                                }
                            />
                        </svg>
                        <span>{showPoints ? 'Ẩn vị trí' : 'Hiển thị vị trí'}</span>
                        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700'></div>
                    </button>
                )}

                {onToggleDrawLines && (
                    <button
                        className={`
                            group relative overflow-hidden px-4 py-1.5 text-[12px] rounded-sm text-sm font-medium
                            transition-all duration-300 ease-in-out transform hover:scale-105
                            flex items-center gap-2 backdrop-blur-sm border
                            ${
                                showDrawLines
                                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-400/30 shadow-lg shadow-green-500/25'
                                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/30'
                            }
                        `}
                        onClick={onToggleDrawLines}
                    >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d={
                                    showDrawLines
                                        ? 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                                        : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                                }
                            />
                        </svg>
                        <span>{showDrawLines ? 'Ẩn đường kẻ' : 'Hiển thị đường kẻ'}</span>
                        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700'></div>
                    </button>
                )}

                {onToggleOverlay && (
                    <button
                        className={`
                            group relative overflow-hidden px-4 py-1.5 text-[12px] rounded-sm text-sm font-medium
                            transition-all duration-300 ease-in-out transform hover:scale-105
                            flex items-center gap-2 backdrop-blur-sm border
                            ${
                                showOverlayImage
                                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-400/30 shadow-lg shadow-orange-500/25'
                                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/30'
                            }
                        `}
                        onClick={onToggleOverlay}
                    >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={5}
                                d={
                                    showOverlayImage
                                        ? 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                                        : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                                }
                            />
                        </svg>
                        <span>{showOverlayImage ? 'Ảnh đè chân mày' : 'Ảnh xóa chân mày'}</span>
                        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700'></div>
                    </button>
                )}

                <button
                    className='
                        group relative overflow-hidden px-4 py-1.5 text-[12px] rounded-sm text-sm font-medium text-white
                        bg-white/10 border border-white/20 backdrop-blur-sm
                        hover:bg-white/20 hover:border-white/30 hover:scale-105
                        transition-all duration-300 ease-in-out transform
                        flex items-center gap-2 shadow-lg
                    '
                    onClick={onToggleSyncMode}
                >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d={
                                syncMode
                                    ? 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                                    : 'M13 10V3L4 14h7v7l9-11h-7z'
                            }
                        />
                    </svg>
                    <span>{syncMode ? 'Đồng bộ' : 'Đơn lẻ'}</span>
                    <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700'></div>
                </button>
                <button
                    className='
                        group relative overflow-hidden px-4 py-1.5 text-[12px] rounded-sm text-sm font-medium
                        bg-gradient-to-r from-purple-500 to-purple-600 text-white 
                        border border-purple-400/30 backdrop-blur-sm
                        hover:from-purple-600 hover:to-purple-700 hover:scale-105
                        transition-all duration-300 ease-in-out transform
                        flex items-center gap-2 shadow-lg shadow-purple-500/25
                    '
                    onClick={toggleMenu}
                >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
                    </svg>
                    <span>Chọn chân mày</span>
                    <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700'></div>
                </button>
                <button
                    className='
                        group relative overflow-hidden px-4 py-1.5 text-[12px] rounded-sm text-sm font-medium
                        bg-gradient-to-r from-red-500 to-red-600 text-white 
                        border border-red-400/30 backdrop-blur-sm
                        hover:from-red-600 hover:to-red-700 hover:scale-105
                        transition-all duration-300 ease-in-out transform
                        flex items-center gap-2 shadow-lg shadow-red-500/25
                    '
                    onClick={handleSave}
                >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                    </svg>
                    <span>Đóng</span>
                    <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700'></div>
                </button>
            </div>

            {/* Menu Overlay */}
            {isMenuOpen && <div className='fixed inset-0 bg-black/50 z-[60]' onClick={toggleMenu} />}

            {/* Sliding Menu */}
            <div
                className={`
                fixed top-0 right-0 h-full w-[20%] min-w-[300px] bg-white shadow-2xl z-[999999]
                transform transition-transform duration-300 ease-in-out
                ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
            `}
            >
                <div className='p-6 h-full overflow-y-auto'>
                    {/* Menu Header */}
                    <div className='flex items-center justify-between mb-6 pb-4 border-b border-gray-200'>
                        <h3 className='text-lg font-semibold text-gray-800'>Chân mày đề xuất</h3>
                        <button onClick={toggleMenu} className='p-2 rounded-lg hover:bg-gray-100 transition-colors'>
                            <svg className='w-5 h-5 text-gray-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                            </svg>
                        </button>
                    </div>

                    {/* Eyebrow List */}
                    <div className='space-y-3'>
                        {availableEyebrows.length > 0 ? (
                            <EyebrowList
                                availableEyebrows={availableEyebrows}
                                placedBoxes={placedBoxes}
                                handleDoubleClick={(eyebrow) => {
                                    if (onDoubleClick) {
                                        onDoubleClick(eyebrow)
                                    }
                                    setIsMenuOpen(false) // Close menu after selection
                                }}
                            />
                        ) : (
                            <div className='text-center text-gray-500 py-8'>
                                <svg
                                    className='w-12 h-12 mx-auto mb-3 text-gray-300'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'
                                    />
                                </svg>
                                <p>Chưa có chân mày nào</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className='absolute inset-0 bg-black/20'></div>
            <div className='relative w-[568px] h-[568px]'>
                <div className='w-full h-full flex items-center justify-center '>{children}</div>
            </div>
        </div>
    )
}
