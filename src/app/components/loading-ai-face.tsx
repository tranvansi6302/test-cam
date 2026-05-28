import './ai-loading-overlay.css'

const LoadingAiFace = () => {
    return (
        <div
            className='absolute inset-0 z-50 bg-[#060913] flex flex-col items-center justify-center overflow-hidden'
            style={{ width: '100%', height: '100%' }}
        >
            {/* Soft, beautiful radial background glow to look extremely premium */}
            <div className='absolute w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[100px] -z-10 animate-pulse' style={{ animationDuration: '4s' }}></div>

            <div className='relative flex flex-col items-center z-10 max-w-sm px-6 w-full'>
                
                {/* Modern Minimal AI Ring Loader */}
                <div className='relative w-24 h-24 flex items-center justify-center mb-10'>
                    {/* Glowing outer blur */}
                    <div className='absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 blur-xl opacity-20 animate-pulse'></div>
                    
                    {/* Spinning double outer arcs */}
                    <div className='absolute inset-0 rounded-full border border-cyan-500/10 border-t-cyan-400 animate-spin' style={{ animationDuration: '1.2s' }}></div>
                    <div className='absolute inset-2 rounded-full border border-blue-500/5 border-b-blue-400 animate-spin' style={{ animationDuration: '1.8s', animationDirection: 'reverse' }}></div>
                    
                    {/* Center elegant dot */}
                    <div className='w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-pulse'></div>
                </div>

                {/* Subtitle / Tech tag */}
                <div className='text-cyan-400/80 text-[10px] font-bold tracking-[0.3em] uppercase mb-3 text-center'>
                    AI Face Analyzer
                </div>

                {/* Loading text / Main Title */}
                <h2 className='text-white font-medium text-lg mb-2 text-center tracking-wide'>
                    Đang khởi tạo hệ thống
                </h2>

                {/* System status */}
                <p className='text-white/60 text-xs text-center font-normal mb-8 leading-relaxed max-w-[200px]'>
                    Đang tải mô hình nhận diện khuôn mặt...
                </p>

                {/* Elegant, thin Progress bar */}
                <div className='w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner'>
                    <div className='progress-bar'></div>
                </div>
                
            </div>
        </div>
    )
}

export default LoadingAiFace
