import { Save } from 'lucide-react'
import { useState } from 'react'

interface SaveButtonProps {
    onClick: () => void
    className?: string
}

export default function SaveButton({ onClick, className = '' }: SaveButtonProps) {
    const [showTooltip, setShowTooltip] = useState(false)

    return (
        <div className='relative'>
            <button
                onClick={onClick}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className={`fixed bottom-16 right-4 z-20 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center shadow-lg transition-all ${className}`}
            >
                <Save size={20} className='text-white' />
            </button>

            {showTooltip && (
                <div className='fixed bottom-[116px] right-4 bg-gray-800 text-white text-xs rounded py-1 px-2 z-20 min-w-24 text-center'>
                    Lưu kết quả
                </div>
            )}
        </div>
    )
}
