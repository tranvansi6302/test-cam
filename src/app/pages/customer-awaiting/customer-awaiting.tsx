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
        <div className='flex flex-col gap-3 border border-dashed border-gray-200 rounded p-3'>
            <div className='flex gap-4'>
                <Skeleton width='135px' height='135px' className='rounded' />
                <div className='flex-1 flex flex-col justify-center gap-2'>
                    <Skeleton width='100px' height='24px' className='rounded-full' />
                    <Skeleton width='200px' height='20px' />
                    <Skeleton width='180px' height='20px' />
                    <Skeleton width='150px' height='20px' />
                    <Skeleton width='220px' height='20px' />
                </div>
                <div className='hidden sm:flex flex-col justify-start gap-1.5'>
                    <div className='flex  gap-1.5 flex-col'>
                        <Skeleton width='90px' height='33px' />
                        <Skeleton width='90px' height='33px' />
                        <Skeleton width='110px' height='33px' />
                    </div>
                </div>
            </div>
            <div className='flex sm:hidden gap-1.5'>
                <Skeleton width='33%' height='38px' />
                <Skeleton width='33%' height='38px' />
                <Skeleton width='33%' height='38px' />
            </div>
        </div>
    )

    return (
        <>
            <AppHeader />
            <ModalBooking visible={showBookingModal} onHide={() => setShowBookingModal(false)} />

            <div className='w-full bg-white border-b border-gray-200 fixed top-0 left-0 z-10'>
                {/* Main header row */}
                <div className='max-w-[1350px] mx-auto px-4 max-sm:px-2 h-[50px] flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <button
                            onClick={() => navigate(-1)}
                            className='mr-1 p-1 cursor-pointer bg-gray-100 rounded-full hover:bg-gray-200 transition'
                        >
                            <ArrowLeft size={16} className='text-gray-600' />
                        </button>
                        <Info size={16} className='text-blue-600' />

                        <h1 className='font-medium text-[15px]'>Khách hàng</h1>

                        {/* Filter dropdown for desktop */}
                        <div className='ml-3 filter-dropdown-container hidden 2xl:block xl:block lg:block'>
                            <Dropdown
                                value={activeFilter}
                                onChange={(e) => {
                                    setActiveFilter(e.value)
                                }}
                                style={{ height: '32px', fontSize: '13px' }}
                                options={filterOptions}
                                optionLabel='name'
                                placeholder='Tất cả'
                                className='min-w-[140px]'
                            />
                        </div>

                        <div className='h-4 w-[1px] bg-gray-300 mx-3 hidden 2xl:block xl:block lg:block'></div>

                        {/* Status filters for desktop */}
                        <div className='hidden 2xl:flex xl:flex lg:flex items-center gap-3'>
                            <div className={`px-2 py-1 rounded-md ${activeFilter === 0 ? 'bg-yellow-100' : 'bg-yellow-50'}`}>
                                <span className='text-[13px] text-yellow-500'>
                                    Đang đợi: <span className='font-bold'>{countCustomerByStatus(0)}</span>
                                </span>
                            </div>
                            <div className={`px-2 py-1 rounded-md ${activeFilter === 1 ? 'bg-blue-100' : 'bg-blue-50'}`}>
                                <span className='text-[13px] text-blue-700'>
                                    Đã phân tích: <span className='font-bold'>{countCustomerByStatus(1)}</span>
                                </span>
                            </div>
                            <div className={`px-2 py-1 rounded-md ${activeFilter === 2 ? 'bg-green-100' : 'bg-green-50'}`}>
                                <span className='text-[13px] text-green-700'>
                                    Đã hoàn thành: <span className='font-bold'>{countCustomerByStatus(2)}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className='flex items-center gap-2 header-buttons'>
                        {/* <button
                            onClick={handleOpenBooking}
                            className='cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 text-[13px] hover:bg-green-100 transition rounded'
                        >
                            <Calendar size={14} />
                            <span>Đặt lịch</span>
                        </button> */}
                        <button
                            onClick={handleRefresh}
                            className='cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 text-[13px] hover:bg-blue-100 transition rounded'
                        >
                            <RefreshCw size={14} />
                            <span>Làm mới</span>
                        </button>
                    </div>
                </div>

                {/* Mobile filter row (only visible on mobile and small tablets) */}
                <div className='mobile-filter-row max-w-[1350px] mx-auto 2xl:hidden xl:hidden lg:hidden'>
                    {/* Filter dropdown for mobile */}
                    <div className='filter-dropdown-container'>
                        <Dropdown
                            value={activeFilter}
                            onChange={(e) => {
                                setActiveFilter(e.value)
                            }}
                            style={{ height: '32px', fontSize: '13px' }}
                            options={filterOptions}
                            optionLabel='name'
                            placeholder='Tất cả'
                            className='min-w-[140px]'
                        />
                    </div>

                    {/* Status filters for mobile */}
                    <div className='flex items-center gap-3 status-filters'>
                        <div className={`px-2 py-1 rounded-md ${activeFilter === 0 ? 'bg-yellow-100' : 'bg-yellow-50'}`}>
                            <span className='text-[13px] text-yellow-500'>
                                Đang đợi: <span className='font-bold'>{countCustomerByStatus(0)}</span>
                            </span>
                        </div>
                        <div className={`px-2 py-1 rounded-md ${activeFilter === 1 ? 'bg-blue-100' : 'bg-blue-50'}`}>
                            <span className='text-[13px] text-blue-700'>
                                Đã phân tích: <span className='font-bold'>{countCustomerByStatus(1)}</span>
                            </span>
                        </div>
                        <div className={`px-2 py-1 rounded-md ${activeFilter === 2 ? 'bg-green-100' : 'bg-green-50'}`}>
                            <span className='text-[13px] text-green-700'>
                                Đã hoàn thành: <span className='font-bold'>{countCustomerByStatus(2)}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <main className='w-full max-w-[1350px] mx-auto px-4 max-sm:px-2 pb-[70px] pt-[75px] main-content'>
                <div className='flex flex-col gap-[10px]'>
                    {isLoading ? (
                        <>
                            {[...Array(3)].map((_, index) => (
                                <CustomerSkeletonItem key={index} />
                            ))}
                        </>
                    ) : (
                        <>
                            {aiFaceList && aiFaceList.data && aiFaceList.data.data && aiFaceList.data.data.length > 0 ? (
                                filteredData().map((aiFace) => <CustomerAwaitingItem key={aiFace.id} aiFace={aiFace} />)
                            ) : (
                                <div className='flex flex-col items-center justify-center py-10 text-gray-500'>
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        width='64'
                                        height='64'
                                        viewBox='0 0 24 24'
                                        fill='none'
                                        stroke='currentColor'
                                        strokeWidth='1'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    >
                                        <rect x='2' y='2' width='20' height='20' rx='2.18' ry='2.18' />
                                        <line x1='7' y1='2' x2='7' y2='22' />
                                        <line x1='17' y1='2' x2='17' y2='22' />
                                        <line x1='2' y1='12' x2='22' y2='12' />
                                        <line x1='2' y1='7' x2='7' y2='7' />
                                        <line x1='2' y1='17' x2='7' y2='17' />
                                        <line x1='17' y1='17' x2='22' y2='17' />
                                        <line x1='17' y1='7' x2='22' y2='7' />
                                    </svg>
                                    <p className='mt-4 font-medium'>Không có dữ liệu khách hàng</p>
                                    <p className='mt-1 text-sm'>Chụp ảnh khách hàng mới để bắt đầu phân tích</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </>
    )
}
