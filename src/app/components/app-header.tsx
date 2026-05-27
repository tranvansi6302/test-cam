import { ChevronDown, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDeviceAndBrowser } from '../hooks/use-device-and-browser'
import { useIpAddress } from '../hooks/use-ip-address'
import { useAuthCompnanyStore } from '../stores/auth-company.store'
import { removeProfileLocalStorage } from '../utils/storage'
import { useNavigate } from 'react-router-dom'

export default function AppHeader() {
    const [showDropdown, setShowDropdown] = useState(false)
    const [currentDateTime, setCurrentDateTime] = useState('')

    const { browserName, deviceInfo } = useDeviceAndBrowser()
    const { publicIP } = useIpAddress()
    const { authCompany } = useAuthCompnanyStore()
    const navigate = useNavigate()
    useEffect(() => {
        const updateDateTime = () => {
            const date = new Date()
            const options: Intl.DateTimeFormatOptions = {
                weekday: 'long',
                day: 'numeric',
                month: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }

            // Format date and time with dot separators
            const formattedDate = date.toLocaleDateString('vi-VN', options)
            // Add dot separator between date and time
            const dateTimeParts = formattedDate.split(',')
            if (dateTimeParts.length > 1) {
                const timePart = dateTimeParts[dateTimeParts.length - 1].trim()
                const datePart = dateTimeParts.slice(0, dateTimeParts.length - 1).join(',')
                setCurrentDateTime(`${datePart} • ${timePart}`)
            } else {
                setCurrentDateTime(formattedDate)
            }
        }

        updateDateTime()
        const intervalId = setInterval(updateDateTime, 60000) // Update every minute

        return () => clearInterval(intervalId)
    }, [])

    const logout = () => {
        removeProfileLocalStorage()
        navigate('/14.241.237.27')
    }

    return (
        <header className='w-full bg-[#156953] border-t border-gray-200 shadow-sm fixed bottom-0 left-0 z-10'>
            <div className='max-w-[1350px] mx-auto px-4 max-sm:px-2 h-[45px] flex items-center justify-between'>
                <div className='flex items-center gap-4 min-w-0'>
                    {/* Facility name */}
                    <div className='min-w-0'>
                        <p className='text-sm font-medium text-white truncate'>Cơ sở Hoa Lan</p>
                        <p className='text-xs text-gray-200 truncate'>Phú Nhuận, TP.HCM • {currentDateTime}</p>
                    </div>
                </div>

                {/* Device info section - modified to always show IP and device on iPad */}
                <div className='flex items-center gap-2 max-md:hidden'>
                    <div className='flex items-center gap-1 whitespace-nowrap'>
                        <p className='text-xs text-white font-medium'>Thiết bị:</p>
                        <p className='text-xs text-gray-200'>{deviceInfo}</p>
                    </div>
                    <div className='h-3 w-[1px] bg-gray-400'></div>
                    <div className='flex items-center gap-1 whitespace-nowrap'>
                        <p className='text-xs text-white font-medium'>IP:</p>
                        <p className='text-xs text-gray-200'>{publicIP || 'N/A'}</p>
                    </div>
                    <div className='h-3 w-[1px] bg-gray-400 md:hidden lg:block'></div>
                    <div className='flex items-center gap-1 whitespace-nowrap md:hidden lg:flex'>
                        <p className='text-xs text-white font-medium'>Trình duyệt:</p>
                        <p className='text-xs text-gray-200'>{browserName}</p>
                    </div>
                </div>

                {/* User info */}
                <div className='relative min-w-0 flex-shrink-0'>
                    <div className='flex items-center gap-2 cursor-pointer' onClick={() => setShowDropdown(!showDropdown)}>
                        <div className='w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0'>
                            <img src={authCompany?.image} alt={authCompany?.name} className='object-cover w-full rounded-full' />
                        </div>
                        <div className='hidden sm:block min-w-0'>
                            <p className='text-sm font-medium text-white truncate'>{authCompany?.name || 'Công ty ABC'}</p>
                            <p className='text-xs text-gray-200 truncate'>{authCompany?.taxCode || 'MST: 0123456789'}</p>
                        </div>
                        <ChevronDown size={14} className='text-gray-200 flex-shrink-0' />
                    </div>

                    {/* Dropdown menu */}
                    {showDropdown && (
                        <div
                            onClick={logout}
                            className='absolute right-0 bottom-14 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100'
                        >
                            <button className='w-full px-4 py-2 text-sm text-left text-red-500 hover:bg-gray-50 flex items-center gap-2'>
                                <LogOut size={14} />
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
