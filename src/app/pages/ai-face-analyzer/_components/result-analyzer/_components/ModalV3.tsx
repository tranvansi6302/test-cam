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
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    const handleSave = () => {
        if (onSave) {
            onSave()
        }
    }

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    return (
        <div className='fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-4'>
            {/* Elegant Dark Header Bar */}
            <div className='absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-4 z-[40] bg-gradient-to-b from-black/80 to-transparent'>
                <button
                    onClick={handleSave}
                    className='p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95 duration-200'
                    title='Đóng'
                >
                    <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                    </svg>
                </button>
                <span className='text-white text-xs md:text-sm font-semibold tracking-wider text-center'>Tinh chỉnh chân mày</span>
                <button
                    onClick={handleSave}
                    className='px-5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-95 text-white rounded-full text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all'
                >
                    Lưu lại
                </button>
            </div>

            {/* Main Central Canvas area - Dark Container for Focus */}
            <div className='relative w-[302px] h-[302px] aspect-square rounded-xl overflow-hidden border border-white/10 shadow-2xl z-[30] bg-[#121620]'>
                <div className='w-full h-full flex items-center justify-center'>{children}</div>
            </div>

            {/* Bottom Premium Toolbar - Dark Glassmorphism */}
            <div className='absolute bottom-8 left-0 right-0 flex items-center justify-center gap-4 px-6 z-[40]'>
                {/* Display settings trigger */}
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className='flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all min-w-[75px]'
                >
                    <svg className='w-5 h-5 text-cyan-400' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' />
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                    </svg>
                    <span className='text-[10px] font-semibold tracking-wide'>Cài đặt</span>
                </button>

                {/* Eyebrow list menu trigger */}
                <button
                    onClick={toggleMenu}
                    className='flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 backdrop-blur-md text-white hover:from-purple-500/30 hover:to-indigo-500/30 hover:scale-105 active:scale-95 transition-all min-w-[75px]'
                >
                    <svg className='w-5 h-5 text-purple-400' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
                    </svg>
                    <span className='text-[10px] font-semibold tracking-wide'>Dáng mày</span>
                </button>

                {/* Sync Mode trigger */}
                {onToggleSyncMode && (
                    <button
                        onClick={onToggleSyncMode}
                        className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl border backdrop-blur-md hover:scale-105 active:scale-95 transition-all min-w-[75px] ${
                            syncMode
                                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300 shadow-sm'
                                : 'bg-white/10 border border-white/10 text-white'
                        }`}
                    >
                        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' />
                        </svg>
                        <span className='text-[10px] font-semibold tracking-wide'>{syncMode ? 'Đồng bộ' : 'Đơn lẻ'}</span>
                    </button>
                )}
            </div>

            {/* Slide-Up Settings Bottom Sheet - GORGEOUS LIGHT MODE */}
            {isSettingsOpen && (
                <div
                    className='fixed inset-0 bg-black/40 z-[70] transition-opacity duration-300'
                    onClick={() => setIsSettingsOpen(false)}
                />
            )}
            <div
                className={`
                    fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/80 rounded-t-3xl z-[80]
                    transform transition-transform duration-300 ease-in-out p-6 max-w-md mx-auto w-full shadow-2xl
                    ${isSettingsOpen ? 'translate-y-0' : 'translate-y-full'}
                `}
            >
                {/* Drag Handle Indicator */}
                <div className='w-12 h-1 bg-slate-300 rounded-full mx-auto mb-6' />

                <div className='flex items-center justify-between mb-6 pb-3 border-b border-slate-100'>
                    <h3 className='text-sm font-bold text-slate-800 uppercase tracking-wider'>Cấu hình hiển thị</h3>
                    <button
                        onClick={() => setIsSettingsOpen(false)}
                        className='text-[12px] font-bold text-cyan-600 hover:text-cyan-500 transition-colors'
                    >
                        Đồng ý
                    </button>
                </div>

                <div className='space-y-4'>
                    {/* Toggle Points */}
                    {onTogglePoints && (
                        <div className='flex items-center justify-between py-2 border-b border-slate-100/60'>
                            <span className='text-slate-700 text-xs font-semibold'>Hiển thị điểm định vị (Chấm xanh)</span>
                            <button
                                onClick={onTogglePoints}
                                className={`w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none relative ${
                                    showPoints ? 'bg-cyan-500 shadow-sm shadow-cyan-500/20' : 'bg-slate-200/80 border border-slate-300/40'
                                }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 bg-white w-4.5 h-4.5 rounded-full transition-transform duration-200 shadow-sm ${
                                        showPoints ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>
                    )}

                    {/* Toggle Draw Lines */}
                    {onToggleDrawLines && (
                        <div className='flex items-center justify-between py-2 border-b border-slate-100/60'>
                            <span className='text-slate-700 text-xs font-semibold'>Hiển thị đường căn chỉnh (Nét đứt)</span>
                            <button
                                onClick={onToggleDrawLines}
                                className={`w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none relative ${
                                    showDrawLines ? 'bg-emerald-500 shadow-sm shadow-emerald-500/20' : 'bg-slate-200/80 border border-slate-300/40'
                                }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 bg-white w-4.5 h-4.5 rounded-full transition-transform duration-200 shadow-sm ${
                                        showDrawLines ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>
                    )}

                    {/* Toggle Overlay Image */}
                    {onToggleOverlay && (
                        <div className='flex items-center justify-between py-2 border-b border-slate-100/60'>
                            <span className='text-slate-700 text-xs font-semibold'>Ảnh đè nền (Hiện chân mày gốc)</span>
                            <button
                                onClick={onToggleOverlay}
                                className={`w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none relative ${
                                    showOverlayImage ? 'bg-orange-500 shadow-sm shadow-orange-500/20' : 'bg-slate-200/80 border border-slate-300/40'
                                }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 bg-white w-4.5 h-4.5 rounded-full transition-transform duration-200 shadow-sm ${
                                        showOverlayImage ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>
                    )}

                    {/* Toggle Sync Mode */}
                    {onToggleSyncMode && (
                        <div className='flex items-center justify-between py-2'>
                            <span className='text-slate-700 text-xs font-semibold'>Di chuyển đồng bộ 2 bên chân mày</span>
                            <button
                                onClick={onToggleSyncMode}
                                className={`w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none relative ${
                                    syncMode ? 'bg-purple-500 shadow-sm shadow-purple-500/20' : 'bg-slate-200/80 border border-slate-300/40'
                                }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 bg-white w-4.5 h-4.5 rounded-full transition-transform duration-200 shadow-sm ${
                                        syncMode ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Eyebrow Selection Bottom Sheet - GORGEOUS LIGHT MODE */}
            {isMenuOpen && (
                <div
                    className='fixed inset-0 bg-black/40 z-[70] transition-opacity duration-300'
                    onClick={() => setIsMenuOpen(false)}
                />
            )}
            <div
                className={`
                    fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/80 rounded-t-3xl z-[80]
                    transform transition-transform duration-300 ease-in-out p-6 max-w-md mx-auto w-full max-h-[75vh] flex flex-col shadow-2xl
                    ${isMenuOpen ? 'translate-y-0' : 'translate-y-full'}
                `}
            >
                {/* Drag Handle Indicator */}
                <div className='w-12 h-1 bg-slate-300 rounded-full mx-auto mb-6 flex-shrink-0' />

                <div className='flex items-center justify-between mb-6 pb-3 border-b border-slate-100 flex-shrink-0'>
                    <h3 className='text-sm font-bold text-slate-800 uppercase tracking-wider'>Chọn dáng mày</h3>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className='text-[12px] font-bold text-cyan-600 hover:text-cyan-300 transition-colors'
                    >
                        Đồng ý
                    </button>
                </div>

                {/* Eyebrow List with internal scroll */}
                <div className='overflow-y-auto pr-1 flex-1 scrollbar-none'>
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
                        <div className='text-center text-slate-400 py-8'>
                            <svg
                                className='w-12 h-12 mx-auto mb-3 text-slate-300'
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
                            <p className='text-sm font-medium'>Chưa có dáng chân mày</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
