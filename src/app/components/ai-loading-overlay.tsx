import React from 'react'
import { useAnalysisStore } from '../stores/analysis.store'
import './ai-loading-overlay.css'
import LoadingShape from './loading-shape'

interface AILoadingOverlayProps {
    message?: string
    subMessage?: string
}

const AILoadingOverlay: React.FC<AILoadingOverlayProps> = ({ message = 'Đang phân tích' }) => {
    const { isCallParamChange } = useAnalysisStore()
    if (!isCallParamChange) return null

    return (
        <div
            className='fixed inset-0 z-[9999] bg-black/40 backdrop-blur-[3px] flex items-center justify-center'
            style={{
                animation: 'fadeIn 0.3s ease-out forwards'
            }}
        >
            <div className='relative flex flex-col items-center justify-center'>
                {/* Hiệu ứng ánh sáng nền */}
                <div className='absolute -z-10 w-60 h-60 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full blur-3xl opacity-50'></div>

                {/* Card content với hiệu ứng glass */}
                <div className=' p-8'>
                    {/* Grid lines */}
                    <div className='absolute inset-0 grid grid-cols-8 grid-rows-8 opacity-20 overflow-hidden rounded-2xl pointer-events-none'>
                        {Array.from({ length: 7 }).map((_, i) => (
                            <React.Fragment key={`h-${i}`}>
                                <div
                                    className={`absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent`}
                                    style={{ top: `${(i + 1) * 12.5}%`, opacity: i % 2 === 0 ? 0.8 : 0.4 }}
                                ></div>
                            </React.Fragment>
                        ))}
                        {Array.from({ length: 7 }).map((_, i) => (
                            <React.Fragment key={`v-${i}`}>
                                <div
                                    className={`absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-400 to-transparent`}
                                    style={{ left: `${(i + 1) * 12.5}%`, opacity: i % 2 === 0 ? 0.8 : 0.4 }}
                                ></div>
                            </React.Fragment>
                        ))}
                    </div>

                    {/* LoadingShape */}
                    <div className='relative flex flex-col items-center'>
                        {/* Glow effect behind */}
                        <div className='absolute w-12 h-12 rounded-full bg-cyan-500/30 blur-md animate-pulse'></div>

                        {/* Loading spinner */}
                        <div className='mb-5 scale-110'>
                            <LoadingShape />
                        </div>

                        {/* Message */}
                        <p className='text-white text-center font-medium text-[14px] drop-shadow-md tracking-wide'>{message}</p>

                        {/* Tech decorator line */}
                        <div className='w-24 h-0.5 mt-3 bg-gradient-to-r from-transparent via-cyan-400 to-transparent'></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AILoadingOverlay
