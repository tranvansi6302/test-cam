import { ReactNode } from 'react'

// SectionTitle component props
export interface SectionTitleProps {
    children: ReactNode
    icon?: ReactNode
    isLoading?: boolean
}

/**
 * Component to display a section title with an underline decoration
 */
const SectionTitle = ({ children, icon, isLoading }: SectionTitleProps) => {
    return (
        <div className='flex items-center gap-2'>
            {isLoading ? (
                <>
                    <div className='w-8 h-8 bg-gray-200 rounded-full animate-pulse' />
                    <div className='w-32 h-4 bg-gray-200 rounded animate-pulse' />
                </>
            ) : (
                <>
                    <button className='p-1 rounded-full'>{icon}</button>
                    <h2 className="text-[15px] font-bold italic text-[#676767] relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-12 after:h-[3px] after:bg-gradient-to-r after:from-teal-500 after:to-lime-500 after:rounded-md">
                        {!isLoading && children}
                    </h2>
                </>
            )}
        </div>
    )
}

export default SectionTitle
