import { useQuery } from '@tanstack/react-query'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { Image } from 'primereact/image'
import { ProgressSpinner } from 'primereact/progressspinner'
import { useMemo } from 'react'
import { beautyApi } from '../../../../apis/beauty.api'
import { getFaceShapeVietnameseString } from '../../../../utils/convert'

interface ViewResultProps {
    visible: boolean
    onHide: () => void
    aiFaceId?: number
}

export default function ViewResult({ visible, onHide, aiFaceId }: ViewResultProps) {
    const { data: aiAnalyzerData, isLoading: isLoadingAiAnalyzer } = useQuery({
        queryKey: ['get-all-face-ai-analyzer'],
        queryFn: beautyApi.getAllFaceAIAnalyzer
    })

    const resultData = useMemo(() => {
        return aiAnalyzerData?.data.data.find((item) => item.faceId === aiFaceId)
    }, [aiAnalyzerData, aiFaceId])

    const renderContent = () => {
        if (isLoadingAiAnalyzer) {
            return (
                <div className='flex justify-center items-center p-6'>
                    <ProgressSpinner style={{ width: '50px', height: '50px' }} />
                </div>
            )
        }

        if (!resultData) {
            return <div className='p-4 text-center'>Không có dữ liệu</div>
        }

        return (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-2'>
                <div className='flex flex-col items-center h-full border border-gray-200 rounded-xl overflow-hidden'>
                    <h3 className='text-sm font-medium py-2 px-4 bg-primary/10 w-full text-center text-primary'>Đè chân mày</h3>
                    {resultData.facePhotoEyebrowSingle ? (
                        <div className='w-full h-full flex items-center justify-center p-3'>
                            <Image
                                preview
                                src={resultData.facePhotoEyebrowSingle}
                                alt='Chân mày đơn'
                                className='max-w-full max-h-full object-contain rounded-lg overflow-hidden'
                            />
                        </div>
                    ) : (
                        <div className='w-full h-[200px] bg-gray-50 flex items-center justify-center rounded-lg'>
                            <span className='text-gray-400 text-sm italic'>Không có hình ảnh</span>
                        </div>
                    )}
                </div>

                <div className='flex flex-col items-center h-full border border-gray-200 rounded-xl overflow-hidden'>
                    <h3 className='text-sm font-medium py-2 px-4 bg-primary/10 w-full text-center text-primary'>Xóa chân mày</h3>
                    {resultData.facePhotoEyebrowDouble ? (
                        <div className='w-full h-full flex items-center justify-center p-3'>
                            <Image
                                preview
                                src={resultData.facePhotoEyebrowDouble}
                                alt='Chân mày đôi'
                                className='max-w-full max-h-full object-contain rounded-lg overflow-hidden'
                            />
                        </div>
                    ) : (
                        <div className='w-full h-[200px] bg-gray-50 flex items-center justify-center rounded-lg'>
                            <span className='text-gray-400 text-sm italic'>Không có hình ảnh</span>
                        </div>
                    )}
                </div>

                <div className='md:col-span-2 mt-1'>
                    <div className='bg-green-50 p-3 rounded-lg border border-green-100'>
                        <div className='flex items-center justify-center gap-6'>
                            <p className='text-sm text-gray-600 font-medium'>Kết quả phân tích khuôn mặt:</p>
                            <div className='flex items-center'>
                                <span className='text-sm text-gray-600 font-medium mr-2'>Tỉ lệ vàng:</span>
                                <span className='text-base font-semibold text-orange-500 bg-white px-3 py-1 rounded-md shadow-sm'>
                                    {resultData.facePoint}
                                </span>
                            </div>
                            <div className='h-5 w-px bg-blue-300'></div>
                            <div className='flex items-center'>
                                <span className='text-sm text-gray-600 font-medium mr-2'>Kiểu mặt:</span>
                                <span className='text-base font-semibold text-green-600 bg-white px-3 py-1 rounded-md shadow-sm'>
                                    {getFaceShapeVietnameseString(resultData.faceType)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='viewResult'>
            <Dialog
                header={<h2 className='text-lg font-medium pt-3 px-3'>Kết quả phân tích khuôn mặt</h2>}
                visible={visible}
                onHide={onHide}
                style={{ width: '90vw', maxWidth: '800px' }}
                contentStyle={{ overflow: 'hidden' }}
                breakpoints={{ '768px': '95vw', '576px': '95vw' }}
                footer={
                    <div className='flex justify-end'>
                        <Button label='Đóng' icon='pi pi-times' onClick={onHide} className='p-button-text' />
                    </div>
                }
            >
                {renderContent()}
            </Dialog>
        </div>
    )
}
