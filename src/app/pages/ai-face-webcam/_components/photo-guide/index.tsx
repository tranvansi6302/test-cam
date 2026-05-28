import React from 'react'
import stepImg from '../../../../../assets/imgs/step.png'

const PhotoGuidePanel: React.FC = () => {
    return (
        <div className='p-2 text-gray-700 h-full flex flex-col items-center justify-center bg-gray-50/50'>

            <div className='w-full max-w-full overflow-hidden flex items-center justify-center'>
                <img 
                    src={stepImg} 
                    alt="Hướng dẫn chụp ảnh" 
                    className='w-full h-auto object-contain'
                />
            </div>
        </div>
    )
}

export default PhotoGuidePanel
