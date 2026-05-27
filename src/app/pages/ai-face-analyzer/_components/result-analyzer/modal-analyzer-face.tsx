import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { ReactNode } from 'react'

import { useAnalysisStore } from '../../../../stores/analysis.store'
import { getFaceShapeVietnamese } from '../../../../utils/convert'

// DialogSection component props
interface DialogSectionProps {
    title: string
    children: ReactNode
}

/**
 * Component to display a section within dialogs
 */
export const DialogSection = ({ title, children }: DialogSectionProps) => {
    return (
        <div className='mb-6 last:mb-0'>
            <h3 className="text-base mb-3 text-primary relative text-black before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-4 before:bg-primary before:rounded-md">
                {title}
            </h3>
            <p className='m-0 leading-relaxed text-text-color whitespace-pre-line text-sm'>{children}</p>
        </div>
    )
}

// FaceShapeDialog component props
export interface FaceShapeDialogProps {
    visible: boolean
    onHide: () => void
}

/**
 * Dialog component to display face shape details
 */
export const FaceShapeDialog = ({ visible, onHide }: FaceShapeDialogProps) => {
    const { analysisData } = useAnalysisStore()
    return (
        <Dialog
            header={`Khuôn mặt ${getFaceShapeVietnamese(analysisData)}`}
            visible={visible}
            headerStyle={{
                padding: '16px'
            }}
            style={{ width: '90%', maxWidth: '600px' }}
            onHide={onHide}
            footer={
                <div>
                    <Button label='Đóng' icon='pi pi-times' onClick={onHide} />
                </div>
            }
        >
            <div className='py-4'>
                {analysisData ? (
                    <>
                        <DialogSection title='Mô tả khuôn mặt'>
                            {analysisData.face_shape_description || 'Không có thông tin mô tả khuôn mặt.'}
                        </DialogSection>

                        <DialogSection title='Gợi ý sản phẩm'>
                            {analysisData.product_recommendation || 'Không có thông tin gợi ý sản phẩm.'}
                        </DialogSection>

                        <DialogSection title='Xu hướng hiện tại'>
                            {analysisData.trend_recommendation || 'Không có thông tin xu hướng.'}
                        </DialogSection>
                    </>
                ) : (
                    <p className='p-6 text-center bg-[#fff3ed] border border-dashed border-[#ff9966] rounded-lg text-[#cc3300] font-medium italic'>
                        Không có dữ liệu phân tích khuôn mặt. Không thể phân tích.
                    </p>
                )}
            </div>
        </Dialog>
    )
}

// EyebrowDialog component props
export interface EyebrowDialogProps {
    visible: boolean
    onHide: () => void
}

/**
 * Dialog component to display eyebrow recommendations
 */
export const EyebrowDialog = ({ visible, onHide }: EyebrowDialogProps) => {
    const { analysisData } = useAnalysisStore()
    return (
        <Dialog
            header='Gợi ý kiểu chân mày'
            visible={visible}
            style={{ width: '90%', maxWidth: '600px' }}
            onHide={onHide}
            footer={
                <div>
                    <Button size='small' label='Đóng' icon='pi pi-times' onClick={onHide} />
                </div>
            }
        >
            <div className='py-4'>
                {analysisData?.eyebrow_recommendation ? (
                    <p className='text-sm'>{analysisData.eyebrow_recommendation}</p>
                ) : (
                    <p className='p-6 text-center bg-[#fff3ed]  border border-dashed border-[#ff9966] rounded-lg text-[#cc3300] font-medium italic'>
                        Không có dữ liệu gợi ý chân mày. Không thể phân tích.
                    </p>
                )}
            </div>
        </Dialog>
    )
}
