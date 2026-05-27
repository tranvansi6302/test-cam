import { Skeleton } from 'primereact/skeleton'
import { ReactNode } from 'react'
import { FaceParamType } from '../../ai-face-analyzer'
import AnimatedKnob from './animated-knob'

// Helper function to check if value is valid
const isValueValid = (value: number | undefined): boolean => {
    return value !== undefined && value !== null && !isNaN(value)
}

// KnobItem component props
interface KnobItemProps {
    title: string
    isLoading: boolean

    value?: number
    children?: ReactNode
}

/**
 * Component to display an individual knob with title and loading state
 */
const KnobItem = ({ title, isLoading, value, children }: KnobItemProps) => {
    // Show skeleton when loading, updating, or no valid value exists
    const showSkeleton = isLoading || !isValueValid(value)

    return (
        <div className='flex flex-col items-center justify-center'>
            {showSkeleton ? (
                <>
                    <div className='relative flex items-center justify-center'>
                        <Skeleton width='80px' height='80px' shape='circle' />
                        <div className='absolute top-[47%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-[18px] flex items-center justify-center z-5'>
                            <Skeleton width='40px' height='18px' />
                        </div>
                    </div>
                    <div className='mt-2.5 max-sm:mt-1.5'>
                        <Skeleton width='120px' height='20px' className='mt-2' />
                    </div>
                </>
            ) : (
                <>
                    {children}

                    <p className='text-[13px]  font-medium text-[#545454] text-center'>{title}</p>
                </>
            )}
        </div>
    )
}

// KnobContainer component props
export interface KnobContainerProps {
    isLoading: boolean
    faceParam: FaceParamType
    showAnimation: boolean
}

/**
 * Component to display a set of three metrics as knobs
 */
const KnobContainer = ({ isLoading, faceParam, showAnimation }: KnobContainerProps) => {
    return (
        <div className='grid grid-cols-3 items-center  gap-4 w-full mt-3 max-sm:p-0 md:p-0'>
            <KnobItem title='Tỉ lệ vàng' isLoading={isLoading} value={faceParam.goldenRatio}>
                <AnimatedKnob
                    isLoading={isLoading}
                    value={faceParam.goldenRatio as number}
                    showAnimation={showAnimation}
                    decimals={3}
                    max={1.618}
                    type='golden'
                />
            </KnobItem>
            <KnobItem title='Tỉ lệ của bạn' isLoading={isLoading} value={faceParam.userRatio}>
                <AnimatedKnob
                    isLoading={isLoading}
                    value={faceParam.userRatio as number}
                    showAnimation={showAnimation}
                    decimals={3}
                    max={1.618}
                    type='user'
                />
            </KnobItem>
            <KnobItem title='Chính xác' isLoading={isLoading} value={faceParam.accuracy}>
                <AnimatedKnob
                    isLoading={isLoading}
                    value={faceParam.accuracy as number}
                    showAnimation={showAnimation}
                    decimals={1}
                    suffix='%'
                    type='accuracy'
                />
            </KnobItem>
        </div>
    )
}

export { KnobItem }
export default KnobContainer
