import { AppWindow, Camera, ChartLine, Palette, ScanFace, Workflow } from 'lucide-react'
import React from 'react'

interface ProcessPanelProps {
    activeStep?: number // 1 = Căn chỉnh & chụp, 2 = Phân tích, 3 = Gợi ý, 4 = Trải nghiệm
}

const ProcessPanel: React.FC<ProcessPanelProps> = ({ activeStep = 0 }) => {
    const steps = [
        {
            id: 1,
            icon: Camera,
            title: 'Căn chỉnh & chụp',
            description: 'Định vị khuôn mặt chính xác trong khung hình. Hệ thống tự động chụp ảnh.'
        },
        {
            id: 2,
            icon: ScanFace,
            title: 'Nhận diện khuôn mặt',
            description: 'Công nghệ AI tự động nhận diện và trích xuất khuôn mặt.'
        },
        {
            id: 3,
            icon: ChartLine,
            title: 'Phân tích chuyên sâu',
            description: 'Thuật toán phân tích đường nét khuôn mặt và đưa ra đề xuất kiểu chân mày.'
        },
        {
            id: 4,
            icon: Palette,
            title: 'Tư vấn & thực hiện',
            description: 'Chuyên viên tư vấn và điêu khắc chân mày theo phân tích của hệ thống.'
        },
        {
            id: 5,
            icon: AppWindow,
            title: 'Hoàn thiện & lưu trữ',
            description: 'Kết quả được chụp lại và lưu trữ vào hệ thống để theo dõi tiến trình.'
        }
    ]

    return (
        <div className='p-4 pt-[50px] text-gray-700 h-full flex flex-col items-start justify-start bg-gray-50/50'>
            <h2 className='text-lg font-semibold text-gray-700 mb-4 flex items-center'>
                <Workflow className='w-4 h-4 mr-2 text-gray-600' />
                Quy trình thực hiện
            </h2>

            <div className='space-y-4 relative z-10 w-full max-w-md'>
                {steps.map((step) => {
                    const isActive = activeStep === step.id
                    const isCompleted = activeStep > step.id
                    const IconComponent = step.icon

                    return (
                        <div key={step.id} className='flex gap-3 items-start group'>
                            <div className='flex-shrink-0 relative'>
                                <div
                                    className={`w-9 h-9 rounded-lg p-2 flex items-center justify-center border ${
                                        isActive
                                            ? 'bg-blue-50 border-blue-200'
                                            : isCompleted
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-white border-gray-200'
                                    }`}
                                >
                                    {isCompleted ? (
                                        <svg
                                            className='w-4 h-4 text-green-600'
                                            fill='none'
                                            stroke='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                                strokeWidth={2}
                                                d='M5 13l4 4L19 7'
                                            ></path>
                                        </svg>
                                    ) : (
                                        <IconComponent
                                            className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}
                                            strokeWidth={1.5}
                                        />
                                    )}
                                </div>
                                {/* Number badge */}
                                <div className='absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-[10px] font-medium flex items-center justify-center border border-gray-200'>
                                    {step.id}
                                </div>
                            </div>

                            <div className='flex-1'>
                                <div
                                    className={`p-3 rounded-lg bg-white border ${
                                        isActive
                                            ? 'border-blue-200 shadow-sm'
                                            : isCompleted
                                            ? 'border-green-200'
                                            : 'border-gray-200'
                                    }`}
                                >
                                    <div className='flex items-center justify-between mb-1'>
                                        <h3
                                            className={`font-medium text-sm ${
                                                isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-700'
                                            }`}
                                        >
                                            {step.title}
                                        </h3>

                                        {isActive && (
                                            <span className='px-1.5 py-0.5 text-[10px] bg-blue-50 text-blue-600 rounded-full font-medium'>
                                                Đang xử lý
                                            </span>
                                        )}
                                        {isCompleted && (
                                            <span className='px-1.5 py-0.5 text-[10px] bg-green-50 text-green-600 rounded-full font-medium'>
                                                Hoàn thành
                                            </span>
                                        )}
                                    </div>
                                    <p
                                        className={`text-xs leading-relaxed ${
                                            isActive ? 'text-gray-700' : isCompleted ? 'text-gray-600' : 'text-gray-500'
                                        }`}
                                    >
                                        {step.description}
                                    </p>

                                    {isActive && (
                                        <div className='mt-2 flex items-center space-x-1'>
                                            <div className='w-1 h-1 bg-blue-400 rounded-full animate-pulse'></div>
                                            <div className='w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-75'></div>
                                            <div className='w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-150'></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}

                {activeStep >= 5 && (
                    <div className='mt-4 p-3 bg-green-50 border border-green-200 rounded-lg'>
                        <div className='flex gap-3 items-start'>
                            <div className='w-9 h-9 rounded-lg p-2 bg-white border border-green-200 flex items-center justify-center'>
                                <svg className='w-4 h-4 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                                    ></path>
                                </svg>
                            </div>

                            <div className='flex-1'>
                                <h3 className='font-medium text-sm text-green-700 mb-1'>Quy trình hoàn tất</h3>
                                <p className='text-xs text-gray-600'>Tất cả các bước đã được thực hiện thành công.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProcessPanel
