import { formatDate } from 'date-fns'
import { Calendar, Check, CircleCheck, Clock, MapPin, Phone, User } from 'lucide-react'
import { Image } from 'primereact/image'
import { useState } from 'react'
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

    return (
        <div className='flex flex-col gap-3 border border-dashed border-gray-200 rounded p-3 transition-all duration-300 ease-in-out hover:border-blue-400 hover:shadow'>
            <ViewResult visible={showViewResult} onHide={() => setShowViewResult(false)} aiFaceId={aiFace.id} />
            <ModalBooking
                visible={showBookingModal}
                onHide={() => setShowBookingModal(false)}
                customerId={aiFace.customerId || aiFace.customer?.id}
            />

            <div className='flex gap-4'>
                <div className='w-[135px] h-[135px] rounded overflow-hidden shrink-0'>
                    <Image
                        className='!h-full'
                        imageClassName='h-full w-full object-cover'
                        src={aiFace.facePhotoSource}
                        alt=''
                        preview
                    />
                </div>
                <div className='text-[14px] flex flex-col justify-center gap-2 flex-1'>
                    <div className='flex flex-wrap gap-1 mb-1'>
                        <div
                            className={`flex items-center gap-1 px-2 py-0.5 text-[11px] rounded ${
                                aiFace.isActived >= 0
                                    ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                    : 'bg-gray-50 text-gray-400 border border-gray-200'
                            }`}
                        >
                            <Clock size={11} />
                            Đang chờ
                        </div>
                        <div
                            className={`flex items-center gap-1 px-2 py-0.5 text-[11px] rounded ${
                                aiFace.isActived >= 1
                                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                    : 'bg-gray-50 text-gray-400 border border-gray-200'
                            }`}
                        >
                            <Check size={11} />
                            Hoàn thành phân tích
                        </div>
                        <div
                            className={`flex items-center gap-1 px-2 py-0.5 text-[11px] rounded ${
                                aiFace.isActived >= 2
                                    ? 'bg-green-50 text-green-600 border border-green-200'
                                    : 'bg-gray-50 text-gray-400 border border-gray-200'
                            }`}
                        >
                            <CircleCheck size={11} />
                            Đã lưu kết quả
                        </div>
                    </div>

                    <div className='flex items-center gap-2'>
                        <Calendar size={'16px'} className='text-gray-400' />
                        {/* dd/MM/yyyy HH:mm:ss */}
                        <span className='text-[#666]'>
                            Đã chụp vào lúc: {formatDate(aiFace.faceCreatedDate * 1000, 'dd/MM/yyyy HH:mm:ss')}
                        </span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <User size={'16px'} className='text-gray-400' />
                        <span className='text-[#666]'>
                            {aiFace.customer ? `${aiFace.customer.firstName} ${aiFace.customer.lastName}` : 'Chưa có thông tin'}
                        </span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <Phone size={'16px'} className='text-gray-400' />
                        <span className='text-green-600'>{aiFace.customer?.telContact || 'Chưa có thông tin'}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <MapPin size={'16px'} className='text-gray-400' />
                        <span className='text-[#666]'>{aiFace.customer?.address || 'Chưa có thông tin'}</span>
                    </div>
                </div>
                <div className='hidden sm:flex flex-col justify-start gap-1.5'>
                    <div className='flex flex-col gap-1.5'>
                        {aiFace.isActived === 0 ? (
                            <div className='flex flex-col gap-2'>
                                <p className='text-[12px] text-gray-500 font-medium'>Phân tích chân mày nam hay chân mày nữ?</p>
                                <div
                                    className='flex gap-4 p-2.5 rounded-lg bg-gray-50 border border-gray-100'
                                    role='radiogroup'
                                    aria-label='Chọn loại chân mày'
                                >
                                    <label className='flex items-center gap-2 cursor-pointer select-none'>
                                        <input
                                            type='radio'
                                            name={`eyebrow-${aiFace.id}`}
                                            checked={!isMale}
                                            onChange={() => handleGenderChange(false)}
                                            className='w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500'
                                        />
                                        <span
                                            className={`text-[13px] font-medium ${!isMale ? 'text-pink-600' : 'text-gray-500'}`}
                                        >
                                            Chân mày nữ
                                        </span>
                                    </label>
                                    <label className='flex items-center gap-2 cursor-pointer select-none'>
                                        <input
                                            type='radio'
                                            name={`eyebrow-${aiFace.id}`}
                                            checked={isMale}
                                            onChange={() => handleGenderChange(true)}
                                            className='w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500'
                                        />
                                        <span className={`text-[13px] font-medium ${isMale ? 'text-blue-600' : 'text-gray-500'}`}>
                                            Chân mày nam
                                        </span>
                                    </label>
                                </div>
                                <Link
                                    to={`/ai-face-analyzer?faceId=${aiFace.id}&is_male=${isMale}`}
                                    className='group relative overflow-hidden px-4 py-1.5 text-[12px] rounded-sm text-sm font-medium
                                    bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                                    border border-blue-400/30 backdrop-blur-sm
                                    hover:from-blue-600 hover:to-blue-700 hover:scale-105
                                    transition-all duration-300 ease-in-out transform
                                    flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25'
                                >
                                    <span>Phân tích</span>
                                    <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700'></div>
                                </Link>
                            </div>
                        ) : aiFace.isActived === 1 ? (
                            <>
                                <button
                                    onClick={handleViewResult}
                                    className='group relative overflow-hidden px-4 py-1.5 text-[12px] rounded-sm text-sm font-medium
                                    bg-gradient-to-r from-green-500 to-green-600 text-white 
                                    border border-green-400/30 backdrop-blur-sm
                                    hover:from-green-600 hover:to-green-700 hover:scale-105
                                    transition-all duration-300 ease-in-out transform
                                    flex items-center justify-center gap-2 shadow-lg shadow-green-500/25'
                                >
                                    <span>Kết quả phân tích</span>
                                    <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700'></div>
                                </button>
                                <button
                                    onClick={handleSaveResult}
                                    className='group relative overflow-hidden px-4 py-1.5 text-[12px] rounded-sm text-sm font-medium
                                    bg-gradient-to-r from-yellow-500 to-yellow-600 text-white 
                                    border border-yellow-400/30 backdrop-blur-sm
                                    hover:from-yellow-600 hover:to-yellow-700 hover:scale-105
                                    transition-all duration-300 ease-in-out transform
                                    flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/25'
                                >
                                    <span>Lưu kết quả</span>
                                    <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700'></div>
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleViewResult}
                                    className='group relative overflow-hidden px-4 py-1.5 text-[12px] rounded-sm text-sm font-medium
                                    bg-gradient-to-r from-green-500 to-green-600 text-white 
                                    border border-green-400/30 backdrop-blur-sm
                                    hover:from-green-600 hover:to-green-700 hover:scale-105
                                    transition-all duration-300 ease-in-out transform
                                    flex items-center justify-center gap-2 shadow-lg shadow-green-500/25'
                                >
                                    <span>Kết quả phân tích</span>
                                    <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700'></div>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className='flex sm:hidden gap-1.5'>
                {aiFace.isActived === 0 ? (
                    <div className='flex flex-col gap-2 w-full'>
                        <p className='text-[12px] text-gray-500 font-medium'>Phân tích chân mày nam hay chân mày nữ?</p>
                        <div
                            className='flex gap-4 p-2.5 rounded-lg bg-gray-50 border border-gray-100'
                            role='radiogroup'
                            aria-label='Chọn loại chân mày'
                        >
                            <label className='flex items-center gap-2 cursor-pointer select-none'>
                                <input
                                    type='radio'
                                    name={`eyebrow-mobile-${aiFace.id}`}
                                    checked={!isMale}
                                    onChange={() => handleGenderChange(false)}
                                    className='w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500'
                                />
                                <span className={`text-[13px] font-medium ${!isMale ? 'text-pink-600' : 'text-gray-500'}`}>
                                    Chân mày nữ
                                </span>
                            </label>
                            <label className='flex items-center gap-2 cursor-pointer select-none'>
                                <input
                                    type='radio'
                                    name={`eyebrow-mobile-${aiFace.id}`}
                                    checked={isMale}
                                    onChange={() => handleGenderChange(true)}
                                    className='w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500'
                                />
                                <span className={`text-[13px] font-medium ${isMale ? 'text-blue-600' : 'text-gray-500'}`}>
                                    Chân mày nam
                                </span>
                            </label>
                        </div>
                        <Link
                            to={`/ai-face-analyzer?faceId=${aiFace.id}&is_male=${isMale}`}
                            className='group relative overflow-hidden flex-1 px-4 py-1.5 text-[12px] rounded-sm text-sm font-medium
                            bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                            border border-blue-400/30 backdrop-blur-sm
                            hover:from-blue-600 hover:to-blue-700 hover:scale-105
                            transition-all duration-300 ease-in-out transform
                            flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25'
                        >
                            <span>Phân tích</span>
                            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700'></div>
                        </Link>
                    </div>
                ) : aiFace.isActived === 1 ? (
                    <>
                        <button
                            onClick={handleViewResult}
                            className='group relative overflow-hidden flex-1 px-4 py-1.5 text-[12px] rounded-sm text-sm font-medium
                            bg-gradient-to-r from-green-500 to-green-600 text-white 
                            border border-green-400/30 backdrop-blur-sm
                            hover:from-green-600 hover:to-green-700 hover:scale-105
                            transition-all duration-300 ease-in-out transform
                            flex items-center justify-center gap-2 shadow-lg shadow-green-500/25'
                        >
                            <span>Kết quả phân tích</span>
                            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700'></div>
                        </button>
                        <button
                            onClick={handleSaveResult}
                            className='group relative overflow-hidden flex-1 px-4 py-1.5 text-[12px] rounded-sm text-sm font-medium
                            bg-gradient-to-r from-purple-500 to-purple-600 text-white 
                            border border-purple-400/30 backdrop-blur-sm
                            hover:from-purple-600 hover:to-purple-700 hover:scale-105
                            transition-all duration-300 ease-in-out transform
                            flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25'
                        >
                            <span>Lưu kết quả</span>
                            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700'></div>
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={handleViewResult}
                            className='group relative overflow-hidden flex-1 px-4 py-1.5 text-[12px] rounded-sm text-sm font-medium
                            bg-gradient-to-r from-green-500 to-green-600 text-white 
                            border border-green-400/30 backdrop-blur-sm
                            hover:from-green-600 hover:to-green-700 hover:scale-105
                            transition-all duration-300 ease-in-out transform
                            flex items-center justify-center gap-2 shadow-lg shadow-green-500/25'
                        >
                            <span>Kết quả phân tích</span>
                            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700'></div>
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
