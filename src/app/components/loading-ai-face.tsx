import './ai-loading-overlay.css'

const LoadingAiFace = () => {
    return (
        <div
            className='absolute inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden'
            style={{ width: '100%', height: '100%' }}
        >
            {/* Scanning line effect */}
            <div className='absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan'></div>

            {/* Data streams */}
            <div className='data-stream stream-1'></div>
            <div className='data-stream stream-2'></div>
            <div className='data-stream stream-3'></div>

            {/* Neural network background */}
            <div className='neural-network'>
                <div className='node n1'></div>
                <div className='node n2'></div>
                <div className='node n3'></div>
                <div className='node n4'></div>
                <div className='node n5'></div>
                <div className='connection c1'></div>
                <div className='connection c2'></div>
                <div className='connection c3'></div>
                <div className='connection c4'></div>
            </div>

            <div className='relative flex flex-col items-center z-10'>
                {/* AI Face - Central Element */}
                <div className='relative mb-8 animate-breathe'>
                    {/* Outer rotating ring */}
                    <div className='w-32 h-32 border-2 border-cyan-400 rounded-full animate-spin-slow glow-effect opacity-60'></div>

                    {/* Inner rotating ring */}
                    <div className='absolute inset-4 border border-cyan-300 rounded-full animate-spin-reverse opacity-40'></div>

                    {/* AI Face */}
                    <div className='absolute inset-0 flex items-center justify-center'>
                        <div className='w-16 h-16 relative glow-cyan'>
                            {/* Face outline */}
                            <div className='w-full h-full border border-cyan-400 rounded-lg opacity-80'></div>

                            {/* Face scanner overlay */}
                            <div className='face-scanner'></div>

                            {/* Eyes */}
                            <div className='absolute top-4 left-3 w-2 h-2 bg-cyan-400 rounded-full animate-pulse glow-pulse'></div>
                            <div
                                className='absolute top-4 right-3 w-2 h-2 bg-cyan-400 rounded-full animate-pulse glow-pulse'
                                style={{ animationDelay: '0.5s' }}
                            ></div>

                            {/* Mouth/Sensor line */}
                            <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 w-6 h-px bg-cyan-400 opacity-60 glow-pulse'></div>

                            {/* Tech details */}
                            <div className='absolute -top-1 -right-1 w-3 h-3 border border-cyan-300 opacity-40'></div>
                            <div className='absolute -bottom-1 -left-1 w-3 h-3 border border-cyan-300 opacity-40'></div>

                            {/* Additional tech elements */}
                            <div className='absolute top-1 left-1 w-1 h-1 bg-cyan-400 opacity-60'></div>
                            <div className='absolute bottom-1 right-1 w-1 h-1 bg-cyan-400 opacity-60'></div>
                        </div>
                    </div>

                    {/* Pulse rings */}
                    <div className='absolute inset-0 w-32 h-32 border border-cyan-400 rounded-full animate-ping opacity-20'></div>
                    <div
                        className='absolute inset-0 w-32 h-32 border border-cyan-400 rounded-full animate-ping opacity-10'
                        style={{ animationDelay: '1s' }}
                    ></div>

                    {/* Extra scanning rings */}
                    <div className='absolute inset-2 border border-cyan-300 rounded-full opacity-20 animate-pulse'></div>
                </div>

                {/* Progress bar */}
                <div className='w-64 h-3 bg-gray-800 rounded-full overflow-hidden mb-4 border border-cyan-400/30 glow-cyan'>
                    <div className='progress-bar'></div>
                </div>

                {/* Loading text */}
                <h2 className='text-cyan-400 font-medium text-xl mb-2 tracking-wide glow-pulse'>Đang khởi tạo hệ thống AI</h2>

                {/* System status */}
                <p className='text-cyan-300 text-sm opacity-70 mb-4 animate-pulse'>Đang tải mô hình nhận diện...</p>

                {/* Loading dots */}
                <div className='flex space-x-3'>
                    <div
                        className='w-3 h-3 bg-cyan-500 rounded-full animate-bounce glow-effect'
                        style={{ animationDelay: '0s' }}
                    ></div>
                    <div
                        className='w-3 h-3 bg-cyan-500 rounded-full animate-bounce glow-effect'
                        style={{ animationDelay: '0.2s' }}
                    ></div>
                    <div
                        className='w-3 h-3 bg-cyan-500 rounded-full animate-bounce glow-effect'
                        style={{ animationDelay: '0.4s' }}
                    ></div>
                </div>
            </div>

            {/* Circuit lines at bottom */}
            <div className='circuit-lines'></div>

            {/* Corner tech elements */}
            <div className='absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-cyan-400 opacity-30 glow-cyan'></div>
            <div className='absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-cyan-400 opacity-30 glow-cyan'></div>
            <div className='absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-cyan-400 opacity-30 glow-cyan'></div>
            <div className='absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-cyan-400 opacity-30 glow-cyan'></div>

            {/* Additional corner indicators */}
            <div className='absolute top-6 left-6 w-2 h-2 bg-cyan-400 opacity-50 animate-pulse'></div>
            <div
                className='absolute top-6 right-6 w-2 h-2 bg-cyan-400 opacity-50 animate-pulse'
                style={{ animationDelay: '0.5s' }}
            ></div>
            <div
                className='absolute bottom-6 left-6 w-2 h-2 bg-cyan-400 opacity-50 animate-pulse'
                style={{ animationDelay: '1s' }}
            ></div>
            <div
                className='absolute bottom-6 right-6 w-2 h-2 bg-cyan-400 opacity-50 animate-pulse'
                style={{ animationDelay: '1.5s' }}
            ></div>
        </div>
    )
}

export default LoadingAiFace
