import { formatDate } from 'date-fns'
import { Calendar, Check, CircleCheck, Clock, MapPin, Phone, User } from 'lucide-react'
import { Image } from 'primereact/image'
import { useState, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import ModalBooking from '../../components/modal-customer'
import { FaceAIResponse } from '../../types/beauty.type'
import ViewResult from './_components/view-result/view-result'

interface CustomerAwaitingItemProps {
    aiFace: FaceAIResponse
}

export default function CustomerAwaitingItem({ aiFace }: CustomerAwaitingItemProps) {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const [showViewResult, setShowViewResult] = useState(false)
    const [showBookingModal, setShowBookingModal] = useState(false)
    const [isMale, setIsMale] = useState(() => {
        if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) return false
        return searchParams.get('is_male') === 'true'
    })

    const handleSaveResult = () => {
        navigate(`/webcam-ipad?faceId=${aiFace.id}`)
    }

    const handleViewResult = () => {
        setShowViewResult(true)
    }

    const handleGenderChange = (value: boolean) => {
        setIsMale(value)
        searchParams.set('is_male', value.toString())
        setSearchParams(searchParams)
    }

    const statusBadge = useMemo(() => {
        if (aiFace.isActived === 0) {
            return (
                <span className='inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded bg-amber-50 text-amber-600 border border-amber-200/50 shadow-sm'>
                    <span className='w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse'></span>
                    Đang chờ
                </span>
            )
        } else if (aiFace.isActived === 1) {
            return (
                <span className='inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded bg-blue-50 text-blue-600 border border-blue-200/50 shadow-sm'>
                    <span className='w-1.5 h-1.5 rounded-full bg-blue-500'></span>
                    Đã phân tích
                </span>
            )
        } else {
            return (
                <span className='inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded bg-green-50 text-green-600 border border-green-200/50 shadow-sm'>
                    <span className='w-1.5 h-1.5 rounded-full bg-green-500'></span>
                    Đã lưu kết quả
                </span>
            )
        }
    }, [aiFace.isActived])

    return (
        <div className='flex flex-col gap-3 bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300 ease-in-out'>
            <ViewResult visible={showViewResult} onHide={() => setShowViewResult(false)} aiFaceId={aiFace.id} />
            <ModalBooking
                visible={showBookingModal}
                onHide={() => setShowBookingModal(false)}
                customerId={aiFace.customerId || aiFace.customer?.id}
            />

            <div className='flex flex-col sm:flex-row gap-4 items-stretch'>
                {/* Left side: Avatar and Info */}
                <div className='flex flex-row gap-4 flex-1 min-w-0 items-center sm:items-start'>
                    {/* Portrait Image Container (3:4 ratio) */}
                    <div className='avatar-container w-[85px] h-[113px] sm:w-[105px] sm:h-[140px] rounded-lg overflow-hidden shrink-0 relative group'>
                        <Image
                            className='w-full h-full'
                            imageClassName='h-full w-full object-cover group-hover:scale-105 transition-transform duration-300'
                            src={aiFace.facePhotoSource}
                            alt=''
                            preview
                        />
                    </div>

                    {/* Customer Meta Details */}
                    <div className='text-[13px] flex flex-col justify-center gap-2 flex-1 min-w-0'>
                        <div className='flex flex-wrap items-center gap-2 mb-0.5'>
                            <h3 className='font-semibold text-slate-800 text-[15px]'>
                                {aiFace.customer ? `${aiFace.customer.firstName} ${aiFace.customer.lastName}` : 'Chưa có thông tin'}
                            </h3>
                            {statusBadge}
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5 text-slate-500'>
                            <div className='flex items-center gap-2 min-w-0'>
                                <Calendar size={14} className='text-slate-400 shrink-0' />
                                <span className='text-slate-600'>
                                    Chụp lúc: {formatDate(aiFace.faceCreatedDate * 1000, 'dd/MM/yyyy HH:mm:ss')}
                                </span>
                            </div>
                            <div className='flex items-center gap-2 min-w-0'>
                                <User size={14} className='text-slate-400 shrink-0' />
                                <span className='text-slate-600'>
                                    Khách hàng: {aiFace.customer ? `${aiFace.customer.firstName} ${aiFace.customer.lastName}` : 'Chưa có thông tin'}
                                </span>
                            </div>
                            <div className='flex items-center gap-2 min-w-0'>
                                <Phone size={14} className='text-slate-400 shrink-0' />
                                <span className='text-green-600 font-medium'>
                                    {aiFace.customer?.telContact || 'Chưa có thông tin'}
                                </span>
                            </div>
                            <div className='flex items-center gap-2 min-w-0'>
                                <MapPin size={14} className='text-slate-400 shrink-0' />
                                <span className='text-slate-600'>
                                    Địa chỉ: {aiFace.customer?.address || 'Chưa có thông tin'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side: Action panel on Tablet/Desktop (>= 640px) */}
                <div className='hidden sm:flex flex-col justify-center shrink-0 w-full sm:w-[220px] md:w-[240px] pl-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 gap-2.5'>
                    {aiFace.isActived === 0 ? (
                        <div className='flex flex-col gap-2.5 w-full'>
                            {/* Premium Segmented Gender Switch */}
                            <div className='flex p-0.5 rounded-lg bg-slate-100 border border-slate-200/50 w-full'>
                                <button
                                    type='button'
                                    onClick={() => handleGenderChange(false)}
                                    className={`flex-1 py-1 text-center text-[11px] font-semibold rounded-md transition-all ${
                                        !isMale 
                                            ? 'bg-white text-pink-600 shadow-sm' 
                                            : 'text-slate-600 hover:text-slate-800'
                                    }`}
                                >
                                    Chân mày nữ
                                </button>
                                <button
                                    type='button'
                                    onClick={() => handleGenderChange(true)}
                                    className={`flex-1 py-1 text-center text-[11px] font-semibold rounded-md transition-all ${
                                        isMale 
                                            ? 'bg-white text-blue-600 shadow-sm' 
                                            : 'text-slate-600 hover:text-slate-800'
                                    }`}
                                >
                                    Chân mày nam
                                </button>
                            </div>
                            <Link
                                to={`/ai-face-analyzer?faceId=${aiFace.id}&is_male=${isMale}`}
                                className='w-full py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/10 hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5'
                            >
                                <span>Phân tích</span>
                            </Link>
                        </div>
                    ) : aiFace.isActived === 1 ? (
                        <div className='flex flex-col gap-2 w-full'>
                            <button
                                onClick={handleViewResult}
                                className='w-full py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/50 hover:bg-emerald-100 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center'
                            >
                                Kết quả phân tích
                            </button>
                            <button
                                onClick={handleSaveResult}
                                className='w-full py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/10 hover:from-amber-600 hover:to-orange-600 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center'
                            >
                                Lưu kết quả
                            </button>
                        </div>
                    ) : (
                        <div className='flex flex-col gap-2 w-full'>
                            <button
                                onClick={handleViewResult}
                                className='w-full py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/50 hover:bg-emerald-100 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center'
                            >
                                Kết quả phân tích
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom side: Action panel on Mobile (< 640px) */}
            <div className='flex sm:hidden flex-col gap-2 pt-2.5 border-t border-slate-100 mt-1 w-full'>
                {aiFace.isActived === 0 ? (
                    <div className='flex flex-col gap-2.5 w-full'>
                        {/* Premium Segmented Gender Switch */}
                        <div className='flex p-0.5 rounded-lg bg-slate-100 border border-slate-200/50 w-full'>
                            <button
                                type='button'
                                onClick={() => handleGenderChange(false)}
                                className={`flex-1 py-1.5 text-center text-[11px] font-semibold rounded-md transition-all ${
                                    !isMale 
                                        ? 'bg-white text-pink-600 shadow-sm' 
                                        : 'text-slate-600 hover:text-slate-800'
                                }`}
                            >
                                Chân mày nữ
                            </button>
                            <button
                                type='button'
                                onClick={() => handleGenderChange(true)}
                                className={`flex-1 py-1.5 text-center text-[11px] font-semibold rounded-md transition-all ${
                                    isMale 
                                        ? 'bg-white text-blue-600 shadow-sm' 
                                        : 'text-slate-600 hover:text-slate-800'
                                }`}
                            >
                                Chân mày nam
                            </button>
                        </div>
                        <Link
                            to={`/ai-face-analyzer?faceId=${aiFace.id}&is_male=${isMale}`}
                            className='w-full py-2 text-center text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/10 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5'
                        >
                            <span>Phân tích</span>
                        </Link>
                    </div>
                ) : aiFace.isActived === 1 ? (
                    <div className='flex gap-2 w-full'>
                        <button
                            onClick={handleViewResult}
                            className='flex-1 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/50 hover:bg-emerald-100 active:scale-[0.98] transition-all flex items-center justify-center'
                        >
                            Kết quả
                        </button>
                        <button
                            onClick={handleSaveResult}
                            className='flex-1 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/10 hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] transition-all flex items-center justify-center'
                        >
                            Lưu kết quả
                        </button>
                    </div>
                ) : (
                    <div className='flex gap-2 w-full'>
                        <button
                            onClick={handleViewResult}
                            className='w-full py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/50 hover:bg-emerald-100 active:scale-[0.98] transition-all flex items-center justify-center'
                        >
                            Kết quả phân tích
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
