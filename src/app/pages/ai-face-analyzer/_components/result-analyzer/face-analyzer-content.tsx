import { ChevronRight } from 'lucide-react'
import { Skeleton } from 'primereact/skeleton'

import { useEffect, useState } from 'react'
import { useAnalysisStore } from '../../../../stores/analysis.store'
import { getFaceShapeVietnamese } from '../../../../utils/convert'

// FaceTypeSection component props
export interface FaceTypeSectionProps {
    onShowFaceShapeDialog: () => void
    onShowEyebrowDialog: () => void
}

/**
 * Component to display face analysis section with face type and eyebrow recommendations
 */
const FaceAnalyzerContent = ({ onShowFaceShapeDialog, onShowEyebrowDialog }: FaceTypeSectionProps) => {
    const { analysisData, isCallParamChange } = useAnalysisStore()

    // Add loading delay to prevent flash
    const [renderReady, setRenderReady] = useState(false)

    // Only render content when not in initial loading state
    useEffect(() => {
        if (!isCallParamChange && analysisData) {
            setRenderReady(true)
        } else {
            setRenderReady(false)
        }
    }, [isCallParamChange, analysisData])

    // Render skeletons for loading state
    const renderSkeletons = () => (
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:gap-5'>
            <div className='p-4 bg-white rounded-lg border border-dashed border-slate-200 h-[66px] flex flex-row items-center justify-between gap-4'>
                <div className='flex w-full justify-between items-center'>
                    <Skeleton width='100px' height='24px' />
                    <Skeleton width='100px' height='24px' />
                </div>
            </div>
            <div className='p-4 bg-white rounded-lg border border-dashed border-slate-200 h-[66px] flex flex-row items-center justify-between'>
                <div className='flex w-full justify-between items-center'>
                    <Skeleton width='180px' height='24px' />
                    <Skeleton width='60px' height='24px' />
                </div>
            </div>
        </div>
    )

    // Render actual content when data is ready
    const renderContent = () => (
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:gap-5'>
            <div
                onClick={onShowFaceShapeDialog}
                className='p-4 bg-white rounded-lg border border-dashed border-slate-200 h-[66px] flex flex-row items-center justify-between gap-4 transition-all duration-300 ease-in-out hover:translate-y-[-2px] hover:shadow-md hover:border-indigo-500 cursor-pointer'
            >
                <p className='text-[13px] text-slate-500 m-0 font-medium min-w-[100px]'>Kiểu khuôn mặt</p>
                <div className='flex items-center gap-4 flex-1 justify-end'>
                    <button className='flex rounded-full  items-center gap-2 py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 border-none  text-white text-sm font-medium cursor-pointer transition-all duration-200 ease-in-out shadow-md shadow-indigo-500/20 whitespace-nowrap hover:translate-y-[-1px] hover:shadow-lg hover:shadow-indigo-500/30'>
                        {getFaceShapeVietnamese(analysisData)}
                        <ChevronRight
                            size={16}
                            className='transition-transform duration-200 ease-in-out group-hover:translate-x-0.5'
                        />
                    </button>
                </div>
            </div>
            <div
                onClick={onShowEyebrowDialog}
                className='p-4 bg-white rounded-lg border border-dashed border-slate-200 h-[66px] flex flex-row items-center justify-between transition-all duration-300 ease-in-out hover:translate-y-[-2px] hover:shadow-md hover:border-indigo-500 cursor-pointer'
            >
                <p className='text-[13px] text-slate-500 m-0 font-medium min-w-[100px]'>Bạn phù hợp với chân mày nào?</p>
                <button className='flex items-center  gap-2 py-2 px-4 bg-transparent border-none text-indigo-500 text-sm'>
                    Xem ngay
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    )

    return <div className='mt-4'>{renderReady ? renderContent() : renderSkeletons()}</div>
}

export default FaceAnalyzerContent
