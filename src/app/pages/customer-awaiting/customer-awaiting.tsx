/* eslint-disable react-hooks/exhaustive-deps */
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Info, RefreshCw } from 'lucide-react'
import { Dropdown } from 'primereact/dropdown'
import { Skeleton } from 'primereact/skeleton'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { beautyApi } from '../../apis/beauty.api'
import AppHeader from '../../components/app-header'
import ModalBooking from '../../components/modal-customer'
import { useAnalysisStore } from '../../stores/analysis.store'
import { useEyebrowListStore } from '../../stores/eyebrown.store'
import './customer-awaiting.css'
import CustomerAwaitingItem from './customer-awaiting-item'

// Định nghĩa kiểu dữ liệu cho tùy chọn lọc
interface FilterOption {
    name: string
    value: number
}

export default function CustomerAwaiting() {
    const { setDropZoneSize, setBase64RemoveEyebrow, setBase64WithEyebrow, setPlacedBoxes, setSavedPosition } =
        useEyebrowListStore()
    const { setEyebrowList, setEyesBrows, setAnalysisData } = useAnalysisStore()
    useEffect(() => {
        localStorage.removeItem('dropzoneSize')
        localStorage.removeItem('modal_saved_image')
        setDropZoneSize(0, 0)
        setBase64RemoveEyebrow('')
        setBase64WithEyebrow('')
        setPlacedBoxes([])
        setSavedPosition(null)
        setEyebrowList([])
        setEyesBrows(null)
        setAnalysisData(null)
    }, [])
    const {
        data: aiFaceList,
        refetch,
        isLoading
    } = useQuery({
        queryKey: ['AI_FACE_LIST'],
        queryFn: () => beautyApi.getCompanyFaceAIByCurrentDate({ createdDate: Math.floor(Date.now() / 1000) })
    })

    const toastShownRef = useRef(false)
    const [showBookingModal, setShowBookingModal] = useState(false)

    const filterOptions: FilterOption[] = [
        { name: 'Tất cả', value: -1 },
        { name: 'Đang đợi', value: 0 },
        { name: 'Đã phân tích', value: 1 },
        { name: 'Đã hoàn thành', value: 2 }
    ]
    const [activeFilter, setActiveFilter] = useState<number>(-1) // Mặc định là "Tất cả"

    const navigate = useNavigate()
    const location = useLocation()

    const countCustomerByStatus = (status: number) => {
        if (!aiFaceList?.data?.data) return 0
        return aiFaceList.data.data.filter((aiFace) => aiFace.isActived === status).length || 0
    }

    // Filter data by status
    const filteredData = useCallback(() => {
        if (!aiFaceList?.data?.data) return []
        if (activeFilter === -1) return aiFaceList.data.data || []
        return aiFaceList.data.data.filter((aiFace) => aiFace.isActived == activeFilter) || []
    }, [aiFaceList, activeFilter])

    useEffect(() => {
        if (location.state?.message && !toastShownRef.current) {
            toast.info(location.state.message)
            // Set the ref to true to prevent showing the toast again
            toastShownRef.current = true
            // Clear the state after showing the toast
            window.history.replaceState({}, document.title)
        }
    }, [location.state])

    const handleRefresh = () => {
        refetch()
        toast.success('Đã làm mới thành công')
    }

    const CustomerSkeletonItem = () => (
        <div className='flex flex-col gap-3 bg-white border border-slate-100 rounded-xl p-4 shadow-sm'>
            <div className='flex flex-col sm:flex-row gap-4 items-stretch animate-pulse'>
                <div className='flex flex-row gap-4 flex-1 items-center sm:items-start'>
                    <Skeleton width='85px' height='113px' className='sm:w-[105px] sm:h-[140px] rounded-lg shrink-0' />
                    <div className='flex-1 flex flex-col justify-center gap-2'>
                        <div className='flex items-center gap-2'>
                            <Skeleton width='120px' height='20px' />
                            <Skeleton width='70px' height='16px' className='rounded-full' />
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5'>
                            <Skeleton width='160px' height='16px' />
                            <Skeleton width='140px' height='16px' />
                            <Skeleton width='120px' height='16px' />
                            <Skeleton width='185px' height='16px' />
                        </div>
                    </div>
                </div>
                <div className='hidden sm:flex flex-col justify-center shrink-0 w-[220px] md:w-[240px] pl-4 border-l border-slate-100 gap-2.5'>
                    <Skeleton width='100%' height='32px' className='rounded-lg' />
                    <Skeleton width='100%' height='32px' className='rounded-lg' />
                </div>
            </div>
            <div className='flex sm:hidden flex-col gap-2 pt-2.5 border-t border-slate-100 mt-1 w-full'>
                <Skeleton width='100%' height='36px' className='rounded-lg' />
            </div>
        </div>
    )

    const filterItems = [
        { label: 'Tất cả', value: -1, count: aiFaceList?.data?.data?.length || 0 },
        { label: 'Đang đợi', value: 0, count: countCustomerByStatus(0) },
        { label: 'Đã phân tích', value: 1, count: countCustomerByStatus(1) },
        { label: 'Đã hoàn thành', value: 2, count: countCustomerByStatus(2) }
    ]

    return (
        <>
            <AppHeader />
            <ModalBooking visible={showBookingModal} onHide={() => setShowBookingModal(false)} />

            {/* Premium Sticky Glassmorphic Header */}
            <div className='w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60 fixed top-0 left-0 z-10 shadow-sm'>
                {/* Main header row */}
                <div className='max-w-[1350px] mx-auto px-4 max-sm:px-3 h-[56px] flex items-center justify-between gap-4'>
                    <div className='flex items-center gap-3 min-w-0'>
                        <button
                            onClick={() => navigate(-1)}
                            className='p-1.5 cursor-pointer bg-slate-100 rounded-full hover:bg-slate-200 active:scale-95 transition flex items-center justify-center shrink-0'
                            title='Quay lại'
                        >
                            <ArrowLeft size={16} className='text-slate-600' />
                        </button>
                        
                        <div className='flex items-center gap-2 min-w-0'>
                            <h1 className='font-bold text-slate-800 text-[16px] truncate'>Phân tích khuôn mặt</h1>
                            <span className='px-2 py-0.5 text-[11px] font-bold bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 shrink-0'>
                                {aiFaceList?.data?.data?.length || 0} hàng đợi
                            </span>
                        </div>

                        {/* Filter Tabs for Desktop/Tablet (>= 1024px) */}
                        <div className='ml-6 hidden lg:flex p-1 bg-slate-100 rounded-lg border border-slate-200/50 gap-1 shrink-0'>
                            {filterItems.map((item) => {
                                const isActive = activeFilter === item.value
                                return (
                                    <button
                                        key={item.value}
                                        onClick={() => setActiveFilter(item.value)}
                                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                                            isActive 
                                                ? 'bg-white text-slate-800 shadow-sm border border-slate-100' 
                                                : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
                                        }`}
                                    >
                                        <span>{item.label}</span>
                                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full ${
                                            isActive ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                            {item.count}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className='flex items-center gap-2 shrink-0'>
                        <button
                            onClick={handleRefresh}
                            className='cursor-pointer flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-[13px] font-semibold rounded-lg transition shadow-md shadow-indigo-600/10'
                        >
                            <RefreshCw size={14} className='animate-duration-1000' />
                            <span className='hidden sm:inline'>Làm mới</span>
                        </button>
                    </div>
                </div>

                {/* Sub-header row for Mobile/Tablet (< 1024px) */}
                <div className='lg:hidden px-4 max-sm:px-3 pb-3 pt-0.5 max-w-[1350px] mx-auto'>
                    <div className='flex p-0.5 bg-slate-100 rounded-lg border border-slate-200/50 gap-1 overflow-x-auto whitespace-nowrap scrollbar-none max-w-full'>
                        {filterItems.map((item) => {
                            const isActive = activeFilter === item.value
                            return (
                                <button
                                    key={item.value}
                                    onClick={() => setActiveFilter(item.value)}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                                        isActive 
                                            ? 'bg-white text-slate-800 shadow-sm border border-slate-100' 
                                            : 'text-slate-500 hover:text-slate-800 bg-transparent'
                                    }`}
                                >
                                    <span>{item.label}</span>
                                    <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full ${
                                        isActive ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600'
                                    }`}>
                                        {item.count}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content Area - padded correctly for sticky elements */}
            <main className='w-full max-w-[1350px] mx-auto px-4 max-sm:px-3 pb-[70px] pt-[115px] lg:pt-[76px]'>
                <div className='flex flex-col gap-3.5'>
                    {isLoading ? (
                        <>
                            {[...Array(3)].map((_, index) => (
                                <CustomerSkeletonItem key={index} />
                            ))}
                        </>
                    ) : (
                        <>
                            {aiFaceList && aiFaceList.data && aiFaceList.data.data && aiFaceList.data.data.length > 0 ? (
                                filteredData().length > 0 ? (
                                    filteredData().map((aiFace) => <CustomerAwaitingItem key={aiFace.id} aiFace={aiFace} />)
                                ) : (
                                    <div className='flex flex-col items-center justify-center py-16 bg-white border border-slate-100 rounded-xl p-8 shadow-sm text-slate-500'>
                                        <Info size={40} className='text-slate-300 mb-3' />
                                        <p className='font-semibold text-slate-700'>Không tìm thấy khách hàng ở mục này</p>
                                        <p className='text-sm text-slate-400 mt-1'>Vui lòng chọn bộ lọc khác hoặc làm mới lại danh sách</p>
                                    </div>
                                )
                            ) : (
                                <div className='flex flex-col items-center justify-center py-16 bg-white border border-slate-100 rounded-xl p-8 shadow-sm text-slate-500'>
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        width='48'
                                        height='48'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        stroke='currentColor'
                                        strokeWidth='1.5'
                                        className='text-slate-300 mb-3'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    >
                                        <rect x='2' y='2' width='20' height='20' rx='2' ry='2' />
                                        <path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' />
                                        <line x1='17.5' y1='6.5' x2='17.51' y2='6.5' />
                                    </svg>
                                    <p className='font-semibold text-slate-700'>Chưa có dữ liệu khách hàng chụp ảnh</p>
                                    <p className='text-sm text-slate-400 mt-1'>Vui lòng thực hiện chụp ảnh khách hàng trước để phân tích</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </>
    )
}
