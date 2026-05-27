import { Knob } from 'primereact/knob'
import CountUp from 'react-countup'

// Helper function to check if value is valid
const isValueValid = (value: number | undefined): boolean => {
    return value !== undefined && value !== null && !isNaN(value)
}

// Component props interface
export interface AnimatedKnobProps {
    value: number | undefined
    showAnimation: boolean
    decimals?: number
    suffix?: string
    max?: number
    isLoading?: boolean
    // Tỉ lệ vàng, tỉ lệ người, độ chính xác
    type?: 'golden' | 'user' | 'accuracy'
}

/**
 * A wrapper component for Knob with animation
 */
const AnimatedKnob = ({ value, showAnimation, decimals = 2, suffix = '', max = 100, isLoading = false }: AnimatedKnobProps) => {
    // If value is invalid or is loading, return null
    if (!isValueValid(value) || isLoading) {
        return null
    }

    // Ensure value is a number
    const numericValue = typeof value === 'number' ? value : 0
    const isOverMax = numericValue > max
    const normalizedValue = Math.min(numericValue, max)
    const overMaxValue = isOverMax ? ((numericValue - max) / max) * 100 : 0

    return (
        <div className={`relative flex items-center justify-center ${isOverMax ? 'animate-pulse' : ''}`}>
            {/* Main circle */}
            <Knob
                color='red'
                size={70}
                className='text-center'
                value={(normalizedValue / max) * 100}
                max={100}
                readOnly
                valueTemplate={' '}
            />

            {/* Secondary circle for values exceeding max */}
            {isOverMax && (
                <div className='absolute -top-[5px] -left-[5px] -right-[5px] -bottom-[5px] -z-10'>
                    <Knob className='text-center' value={overMaxValue} max={100} readOnly valueTemplate={' '} />
                </div>
            )}

            <div
                className={`absolute top-[47%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center text-sm font-medium  ${
                    isOverMax ? 'text-red-500' : 'text-indigo-500'
                }`}
            >
                {showAnimation ? (
                    <CountUp
                        className='text-[13px] m-0 p-0 leading-none'
                        start={0}
                        end={numericValue}
                        decimals={decimals}
                        duration={1.5}
                        suffix={suffix}
                    />
                ) : (
                    <span>
                        {numericValue.toFixed(decimals)}
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    )
}

export default AnimatedKnob
