import { Fullscreen, LogOut, Sparkles, Star, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Carousel } from 'primereact/carousel'
import banner2 from '../../../assets/imgs/banner2.jpg'
import banner3 from '../../../assets/imgs/banner3.jpg'
import introVideo from '../../../assets/videos/intro.mp4'
import { useAuthCompnanyStore } from '../../stores/auth-company.store'
import { removeProfileLocalStorage } from '../../utils/storage'
import './home.css'

export default function Home() {
    const navigate = useNavigate()
    const videoRef = useRef<HTMLVideoElement>(null)

    const { authCompany } = useAuthCompnanyStore()
    const [isMuted, setIsMuted] = useState(true)

    const banners = [
        { id: 1, image: banner2 },
        { id: 2, image: banner3 }
    ]

    const bannerTemplate = (banner: { id: number; image: string }) => {
        return (
            <div className='relative ai-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all aspect-[16/10] md:aspect-auto md:h-full mx-1'>
                <img src={banner.image} alt='banner' className='w-full h-full object-cover' />
            </div>
        )
    }

    const handleLogout = () => {
        const confirmLogout = window.confirm('Bạn có chắc chắn muốn đăng xuất?')
        if (confirmLogout) {
            removeProfileLocalStorage()
            navigate('/14.241.237.27')
        }
    }

    // Hàm để bật âm thanh
    const unmute = () => {
        if (videoRef.current) {
            videoRef.current.muted = false
            setIsMuted(false)
        }
    }

    useEffect(() => {
        // Auto-play video when component mounts (initially muted)
        if (videoRef.current) {
            videoRef.current.muted = true
            videoRef.current.play()
        }

        // Cố gắng bật âm thanh khi có bất kỳ tương tác nào với trang
        const handleInteraction = () => {
            unmute()
            // Xóa các event listener sau khi đã bật âm thanh
            document.removeEventListener('click', handleInteraction)
            document.removeEventListener('touchstart', handleInteraction)
            document.removeEventListener('keydown', handleInteraction)
        }

        // Thêm các event listener
        document.addEventListener('click', handleInteraction)
        document.addEventListener('touchstart', handleInteraction)
        document.addEventListener('keydown', handleInteraction)

        return () => {
            // Dọn dẹp các event listener khi component unmount
            document.removeEventListener('click', handleInteraction)
            document.removeEventListener('touchstart', handleInteraction)
            document.removeEventListener('keydown', handleInteraction)
        }
    }, [])

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted
            setIsMuted(!isMuted)
        }
    }

    // Function to navigate to AI face page
    const handleAIFaceClick = () => {
        window.location.href = '/ai-face'
    }

    return (
        <div className='flex flex-col md:flex-row h-screen overflow-hidden bg-gray-50'>
            {/* Left side - Video (60% on tablet, 70% on desktop, top on mobile) */}
            <div className='w-full md:w-[60%] lg:w-[70%] h-[45vh] sm:h-[50vh] md:h-full relative bg-black flex-shrink-0'>
                <video ref={videoRef} className='w-full h-full object-cover' src={introVideo} loop playsInline />

                {/* Video overlay */}
                <div className='absolute inset-0 video-overlay'></div>

                {/* Sound control button */}
                <div className='absolute top-4 right-4 md:top-6 md:right-6 z-10'>
                    <button
                        onClick={toggleMute}
                        className='ai-glass-effect hover:ai-glow text-white p-2.5 md:p-3 rounded-full transition-all'
                    >
                        {isMuted ? <VolumeX size={18} className='md:size-5' /> : <Volume2 size={18} className='md:size-5' />}
                    </button>
                </div>

                {/* Floating Welcome & Logout box at the bottom */}
                <div className='absolute bottom-4 left-4 z-10 max-w-[calc(100%-2rem)] sm:max-w-lg md:max-w-xl lg:max-w-2xl'>
                    <div className='ai-glass-effect text-white px-4 py-2 rounded-full flex items-center shadow-lg gap-3'>
                        <p className='text-xs text-white font-semibold truncate min-w-0'>
                            {`Xin chào: ${authCompany?.name || ''} - ${authCompany?.taxCode || ''}`}
                        </p>
                        <button
                            onClick={handleLogout}
                            className='flex items-center gap-1 bg-red-500/20 hover:bg-red-500/40 text-red-200 hover:text-white px-2.5 py-1 rounded-full text-[10px] md:text-xs font-semibold cursor-pointer border border-red-500/30 transition-all flex-shrink-0'
                        >
                            <LogOut size={12} className='md:size-[14px]' />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Right side - Promotions sidebar (40% on tablet, 30% on desktop, bottom scroll on mobile) */}
            <div className='w-full md:w-[40%] lg:w-[30%] p-3 flex flex-col gap-3 flex-grow md:flex-grow-0 md:h-full overflow-hidden min-h-0'>
                {/* Title Card */}
                <div className='text-center flex-shrink-0'>
                    <div className='py-4 px-5 lg:py-5 lg:px-6 ai-glass-effect rounded-xl shadow-md'>
                        <div className='flex justify-center items-center gap-2 mb-2 lg:mb-3'>
                            <div className='h-0.5 w-8 lg:w-10 bg-gradient-to-r from-pink-400 to-purple-400'></div>
                            <Sparkles size={16} className='text-pink-300 ai-pulse lg:size-[18px]' />
                            <div className='h-0.5 w-8 lg:w-10 bg-gradient-to-r from-purple-400 to-pink-400'></div>
                        </div>
                        <h2 className='text-xl lg:text-2xl font-bold ai-title mb-1 lg:mb-2'>365 AI Beauty</h2>
                        <p className='text-yellow-500 text-opacity-80 text-xs sm:text-sm mt-1'>Đỉnh cao của sắc đẹp, Hoàn hảo của tự nhiên</p>
                        <div className='flex justify-center items-center gap-2 mt-2 lg:mt-3'>
                            <div className='h-0.5 w-12 lg:w-16 bg-gradient-to-r from-pink-400 to-purple-400'></div>
                            <Star size={12} className='text-yellow-300 ai-pulse lg:size-[14px]' />
                            <div className='h-0.5 w-12 lg:w-16 bg-gradient-to-r from-purple-400 to-pink-400'></div>
                        </div>
                    </div>
                </div>

                {/* Banner Slideshow Carousel */}
                <div className='w-full flex-grow min-h-0 select-none pb-1 md:pb-0 overflow-hidden flex flex-col justify-center'>
                    <Carousel
                        value={banners}
                        numVisible={1}
                        numScroll={1}
                        itemTemplate={bannerTemplate}
                        circular
                        autoplayInterval={4000}
                        className='custom-carousel w-full h-full overflow-hidden'
                        showNavigators={false}
                    />
                </div>

                {/* Dashboard Action Button (only on tablet/desktop) */}
                <button
                    onClick={handleAIFaceClick}
                    className='hidden md:flex w-full py-3.5 px-6 rounded-xl text-white font-bold ai-button ai-glow items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all flex-shrink-0'
                >
                    <Fullscreen size={20} />
                    <span>AI Phân tích khuôn mặt</span>
                </button>
            </div>

            {/* Floating Action Button (only on mobile) */}
            <div className='fixed right-4 bottom-4 flex flex-col gap-2 items-center z-20 md:hidden'>
                <button
                    onClick={handleAIFaceClick}
                    className='w-14 h-14 rounded-full text-white ai-button ai-glow flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all'
                >
                    <Fullscreen size={24} />
                </button>
                <span className='text-[10px] font-semibold px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-purple-700 shadow-md border border-purple-100'>
                    AI Phân tích
                </span>
            </div>
        </div>
    )
}

