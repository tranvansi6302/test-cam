import { useCallback, useEffect, useState } from 'react'

import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { beautyApi } from '../../../../apis/beauty.api'
import { useAuthCompnanyStore } from '../../../../stores/auth-company.store'
import { SaveFaceAIRequest } from '../../../../types/beauty.type'
import FaceCropper from '../../../face-cropper'
import { getBrowserNetwork, getIPAddresses } from '../../../../utils/ip.util'

export default function FacePreview({
    previewImageSrc,
    autoProcess = true,
    onSaveStateChange
}: {
    previewImageSrc: string
    autoProcess?: boolean
    onSaveStateChange?: (isSaving: boolean, isComplete?: boolean) => void
}) {
    const { authCompany } = useAuthCompnanyStore()
    const navigate = useNavigate()
    const [imgBase64, setImgBase64] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    // Save face AI mutation
    const saveFaceAIMutation = useMutation({
        mutationFn: beautyApi.saveFaceAI
    })

    // Notify parent about saving state changes
    useEffect(() => {
        if (onSaveStateChange) {
            onSaveStateChange(isSaving)
        }
    }, [isSaving, onSaveStateChange])

    const handleSaveImage = async () => {
        setIsSaving(true)
        if (onSaveStateChange) onSaveStateChange(true)

        const ipInfo = await getIPAddresses()
        const browserNetwork = getBrowserNetwork()
        const finalData: SaveFaceAIRequest = {
            companyId: Number(authCompany?.id) || 1,
            facePhotoSourceBase64: imgBase64,
            ipNetwork: ipInfo.localIP || '',
            browserNetwork: browserNetwork.effectiveType || ''
        }

        console.log('Tạm comment lưu ảnh để test giao diện loading. Dữ liệu chuẩn:', finalData)
        if (false as boolean) {
            console.log(navigate, saveFaceAIMutation)
        }
        // saveFaceAIMutation.mutate(finalData, {
        //     onSuccess: () => {
        //         setIsSaving(false)
        //         // Notify parent that saving is complete and successful
        //         if (onSaveStateChange) onSaveStateChange(false, true)
        //         toast.success('Lưu thông tin thành công')
        //         navigate('/')
        //     },
        //     onError: () => {
        //         setIsSaving(false)
        //         // Notify parent that saving failed
        //         if (onSaveStateChange) onSaveStateChange(false, false)
        //         toast.error('Đã có lỗi xảy ra khi lưu thông tin')
        //     }
        // })
    }

    // When imgBase64 is set and autoProcess is true, save immediately
    useEffect(() => {
        if (imgBase64 && autoProcess) {
            handleSaveImage()
        }
    }, [imgBase64, autoProcess])

    const handleOnFaceCropReady = useCallback(
        async (faceCrop: string) => {
            console.log('handleOnFaceCropReady', faceCrop.substring(0, 50) + '...')

            // Only process valid images
            if (faceCrop.startsWith('data:image')) {
                const finalBase64 = faceCrop.split(',')[1]
                setImgBase64(finalBase64)
            } else {
                console.error('Face crop failed:', faceCrop)
                toast.error('Không thể xử lý khuôn mặt. Vui lòng thử lại.')
                // Notify parent that processing failed
                if (onSaveStateChange) onSaveStateChange(false, false)
            }
        },
        [onSaveStateChange]
    )

    return (
        <div style={{ display: 'none' }}>
            <FaceCropper urlFromProps={previewImageSrc} showUI={false} onFaceCropReady={handleOnFaceCropReady} />
        </div>
    )
}
