import React from 'react'
import { Sun, User, SmilePlus, Ruler, Image, Lightbulb, Plus } from 'lucide-react'

const PhotoGuidePanel: React.FC = () => {
    const guides = [
        {
            id: 1,
            icon: Sun,
            title: 'Ánh sáng',
            description: 'Chọn nơi có ánh sáng đều, tránh ánh sáng phía sau.'
        },
        {
            id: 2,
            icon: User,
            title: 'Tư thế',
            description: 'Giữ đầu thẳng, mắt nhìn trực tiếp vào camera.'
        },
        {
            id: 3,
            icon: SmilePlus,
            title: 'Biểu cảm',
            description: 'Giữ biểu cảm tự nhiên, không cười quá to.'
        },
        {
            id: 4,
            icon: Ruler,
            title: 'Khoảng cách',
            description: 'Duy chuyển khuôn mặt tiến lại gần để khi xuất hiện các điểm trên khuôn mặt.'
        },
        {
            id: 5,
            icon: Plus,
            title: 'Căn chỉnh',
            description:
                'Canh chỉnh điểm trên mũi thẳng với trục y(đường kẻ trên xuống) và canh 2 điểm khóe mắt ngang với trục x (đường kẻ ngang)'
        }
    ]

    return (
        <div className='p-4 pt-[50px] text-gray-700 h-full flex flex-col items-start justify-start bg-gray-50/50'>
            <h2 className='text-lg font-semibold text-gray-700 mb-4 flex items-center'>
                <Image className='w-4 h-4 mr-2 text-gray-600' />
                Hướng dẫn chụp ảnh
            </h2>

            <div className='space-y-4 relative z-10 w-full max-w-md'>
                {guides.map((guide) => (
                    <div key={guide.id} className='flex gap-3 items-start group'>
                        <div className='flex-shrink-0 relative'>
                            <div className='w-9 h-9 rounded-lg p-2 flex items-center justify-center bg-white border border-gray-200'>
                                <guide.icon className='w-4 h-4 text-gray-500' strokeWidth={1.5} />
                            </div>
                            {/* Number badge */}
                            <div className='absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-[10px] font-medium flex items-center justify-center border border-gray-200'>
                                {guide.id}
                            </div>
                        </div>

                        <div className='flex-1'>
                            <div className='p-3 rounded-lg bg-white border border-gray-200'>
                                <h3 className='font-medium text-sm text-gray-700 mb-1'>{guide.title}</h3>
                                <p className='text-xs text-gray-500 leading-relaxed'>{guide.description}</p>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Simple tip box */}
                <div className='mt-4 p-3 bg-green-50 border border-green-200 rounded-lg'>
                    <div className='flex gap-3 items-start'>
                        <div className='w-9 h-9 rounded-lg p-2 bg-white border border-green-200 flex items-center justify-center'>
                            <Lightbulb className='w-4 h-4 text-green-600' strokeWidth={1.5} />
                        </div>

                        <div className='flex-1'>
                            <h3 className='font-medium text-sm text-green-700 mb-1'>Mẹo hữu ích</h3>
                            <p className='text-xs text-gray-600'>
                                Khi 2 đường kẻ và viền khuôn mặt chuyển xanh lá, hệ thống sẽ tự động chụp!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PhotoGuidePanel
