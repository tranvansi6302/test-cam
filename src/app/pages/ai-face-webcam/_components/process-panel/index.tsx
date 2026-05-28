import React from 'react'
import saveImg from '../../../../../assets/imgs/save.png'

interface ProcessPanelProps {
    activeStep?: number
}

const ProcessPanel: React.FC<ProcessPanelProps> = () => {
    return (
        <div className='p-2 text-gray-700 h-full flex flex-col items-center justify-center bg-gray-50/50'>
            <div className='w-full max-w-full overflow-hidden flex items-center justify-center'>
                <img 
                    src={saveImg} 
                    alt="Quy trình thực hiện" 
                    className='w-full h-auto object-contain'
                />
            </div>
        </div>
    )
}

export default ProcessPanel

