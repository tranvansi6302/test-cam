import { useEffect, useState } from 'react'

export const AIRedirectLoading = () => {
    const [dots, setDots] = useState('.')

    useEffect(() => {
        const timer = setTimeout(() => {
            window.location.href = 'https://365aibeauty.com/'
        }, 3000)

        const dotsInterval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? '.' : prev + '.'))
        }, 500)

        return () => {
            clearTimeout(timer)
            clearInterval(dotsInterval)
        }
    }, [])

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-900'>
            <div className='p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm text-center text-white max-w-sm w-full'>
                <h2 className='text-2xl font-semibold mb-4'>AI Beauty System</h2>
                <div className='spinner mx-auto mb-4'></div>
                <p className='text-base'>Đang điều hướng{dots}</p>
                <p className='text-xs mt-2 text-cyan-300/70'>Chuyển hướng đến 365aibeauty.com</p>
                <style>{`
                    .spinner {
                        width: 40px;
                        height: 40px;
                        border: 4px solid rgba(34, 211, 238, 0.2); /* Cyan with low opacity */
                        border-top: 4px solid #22D3EE; /* Bright cyan */
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        box-shadow: 0 0 8px rgba(34, 211, 238, 0.5); /* Subtle glow */
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    )
}
