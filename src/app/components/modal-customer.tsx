import { useMutation } from '@tanstack/react-query'
import { Dialog } from 'primereact/dialog'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { queryClient } from '../../main'
import { beautyApi } from '../apis/beauty.api'
import FormCustomers, { FormCustomersRef, FormData } from '../pages/ai-face-analyzer/_components/form-customers/form-customers'
import { useAnalysisStore } from '../stores/analysis.store'
import { useEyebrowListStore } from '../stores/eyebrown.store'
import { AddCustomerAIFaceRequest, CreateFaceAnalyzerRequest, UpdateFaceAIRequest } from '../types/beauty.type'

// Props for the component
interface ModalCustomerProps {
    visible: boolean
    onHide: () => void
    onSave?: () => void
    customerId?: number
    disableNavigate?: boolean
    faceIdClick?: string
}

export default function ModalCustomer({ visible, onHide, onSave, customerId, disableNavigate, faceIdClick }: ModalCustomerProps) {
    // get faceId
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const faceId = searchParams.get('faceId') || faceIdClick
    // Log faceId only when it changes
    useEffect(() => {
        if (faceId) {
            console.log('faceId changed:', faceId)
        }
    }, [faceId])
    const { analysisData } = useAnalysisStore()
    const { base64RemoveEyebrow, base64WithEyebrow } = useEyebrowListStore()

    // Log analysisData once per change to avoid spamming logs
    const prevAnalysisRef = useRef<typeof analysisData | null>(null)
    useEffect(() => {
        if (prevAnalysisRef.current !== analysisData) {
            console.log('analysisData updated:', analysisData)
            prevAnalysisRef.current = analysisData
        }
    }, [analysisData])
    // State management
    const [isNewCustomer, setIsNewCustomer] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [isLoadingSave, setIsLoadingSave] = useState(false)
    const [isFormReady, setIsFormReady] = useState(false)
    const hasAttachedCustomer = useMemo(() => Boolean(faceId && customerId), [faceId, customerId])
    const formRef = useRef<FormCustomersRef>(null)

    // Track attempt to programmatically select only once per modal open
    const hasAttemptedCustomerSelectionRef = useRef(false)

    // Update face AI mutation
    const updateFaceAIMutation = useMutation({
        mutationFn: ({ id, body }: { id: string; body: UpdateFaceAIRequest }) => beautyApi.updateFaceAI(id, body)
    })
    // Create face analyzer mutation
    const createFaceAnalyzerMutation = useMutation({
        mutationFn: (data: CreateFaceAnalyzerRequest) => beautyApi.createFaceAnalyzer(data)
    })

    // Attempt to select customer programmatically (only once per open)
    const attemptSelectCustomerProgrammatically = useCallback(() => {
        if (
            formRef.current &&
            formRef.current.selectCustomerById &&
            customerId &&
            !hasAttemptedCustomerSelectionRef.current &&
            visible
        ) {
            console.log('Attempting to programmatically select customer by ID:', customerId)
            hasAttemptedCustomerSelectionRef.current = true

            // Slight delay to ensure child form is mounted and customer list fetched
            setTimeout(() => {
                if (formRef.current && formRef.current.selectCustomerById && customerId) {
                    console.log('Calling selectCustomerById with ID:', customerId)
                    formRef.current.selectCustomerById(customerId)
                }
            }, 300)
        }
    }, [customerId, visible])

    // Select customer when conditions are met
    useEffect(() => {
        if (visible && customerId && !hasAttemptedCustomerSelectionRef.current) {
            attemptSelectCustomerProgrammatically()
        }
    }, [visible, customerId, attemptSelectCustomerProgrammatically])

    // Reset the ref when the modal closes
    useEffect(() => {
        if (!visible) {
            hasAttemptedCustomerSelectionRef.current = false
        }
    }, [visible])

    // Handle dialog close
    const handleDialogClose = useCallback(() => {
        if (!visible) return

        hasAttemptedCustomerSelectionRef.current = false
        console.log('Resetting dialog state')

        onHide()
        setIsNewCustomer(false)
        setIsEditing(false)
    }, [onHide, visible])

    // Create customer mutation
    const createCustomerMutation = useMutation({
        mutationFn: (body: AddCustomerAIFaceRequest) => beautyApi.addCustomerAIFace(body)
    })

    // Handle form submission
    const handleFormSubmit = (data: FormData) => {
        console.log('Form submitted with data:', data)
    }

    // Handle save action
    const handleSave = useCallback(async () => {
        try {
            setIsLoadingSave(true)

            // If on ai-face-analyzer and face already has a customer, only create analyzer
            if (faceId && hasAttachedCustomer) {
                // Mark AI Face active with current customer before creating analyzer
                if (customerId) {
                    await updateFaceAIMutation.mutateAsync({
                        id: faceId,
                        body: {
                            isActived: 1,
                            customerId
                        }
                    })
                }

                const faceAnalyzerData: CreateFaceAnalyzerRequest = {
                    facePhotoEyebrowDoubleBase64: base64WithEyebrow.split(',')[1],
                    facePhotoEyebrowSingleBase64: base64RemoveEyebrow.split(',')[1],
                    facePoint: Number(Number(analysisData?.your_face_ratio || 0).toFixed(3)),
                    faceType: analysisData?.face_shape?.shape || 'Unknown',
                    faceId: Number(faceId)
                }
                await createFaceAnalyzerMutation.mutateAsync(faceAnalyzerData)
                toast.success('Lưu kết quả thành công')
                queryClient.invalidateQueries({ queryKey: ['AI_FACE_LIST'] })
                if (faceId) queryClient.invalidateQueries({ queryKey: ['getAIFace', faceId] })
                handleDialogClose()
                if (typeof onSave === 'function') onSave()
                return
            }

            // Get current form values
            const formValues = formRef.current?.getFormValues()

            if (!formValues) {
                console.error('Form values are null or undefined')
                toast.error('Không thể lấy thông tin biểu mẫu')
                setIsLoadingSave(false)
                return
            }

            // Validate birthday format
            if (formValues.birthday && typeof formValues.birthday === 'string') {
                toast.error('Ngày sinh không đúng định dạng, vui lòng kiểm tra lại')
                setIsLoadingSave(false)
                return
            }

            let customerIdLocal: number | null = null

            if (isNewCustomer) {
                console.log('===== PROCESS NEW CUSTOMER =====')

                // Split fullName into firstName and lastName if needed
                const fullName = formValues.fullName || ''
                let firstName = formValues.firstName || ''
                let lastName = formValues.lastName || ''

                // If fullName is provided but firstName/lastName are not fully populated
                if (fullName && (!firstName || !lastName)) {
                    const nameParts = fullName.trim().split(' ')
                    if (nameParts.length > 0) {
                        firstName = nameParts[nameParts.length - 1]
                        lastName = nameParts.slice(0, nameParts.length - 1).join(' ')
                    }
                }

                if (!firstName || !formValues.telContact) {
                    toast.warning('Vui lòng nhập đầy đủ tên và số điện thoại khách hàng')
                    setIsLoadingSave(false)
                    return
                }

                try {
                    const customerResponse = await createCustomerMutation.mutateAsync({
                        aiFaceId: Number(faceId || 0),
                        firstName,
                        lastName,
                        telContact: formValues.telContact,
                        address: formValues.address || '',
                        gender: formValues.gender,
                        partnerId: Number(formValues.partnerId || 0)
                    })
                    if (customerResponse?.data?.data?.id) {
                        customerIdLocal = customerResponse.data.data.id
                    }
                    // If in ai-face, proceed to update active and create analyzer below
                    toast.success('Tạo khách hàng mới thành công')
                } catch (error) {
                    console.error('Error creating customer:', error)
                    toast.error('Lỗi khi tạo khách hàng mới')
                    setIsLoadingSave(false)
                    return
                }
            } else if (formValues.customer) {
                // Đã có thông tin khách hàng chọn ra từ dánh sách
                customerIdLocal = formValues.customer.id
            } else {
                // No customer selected
                console.log('===== NO CUSTOMER SELECTED =====')
                formRef.current?.submitForm()
                toast.warning('Vui lòng chọn khách hàng hoặc tạo khách hàng mới')
                setIsLoadingSave(false)
                return
            }

            // Success
            if (customerIdLocal) {
                if (faceId) {
                    // Only on ai-face-analyzer page: attach customer to AI face and create analyzer
                    await updateFaceAIMutation.mutateAsync({
                        id: faceId,
                        body: {
                            isActived: 1,
                            customerId: customerIdLocal
                        }
                    })

                    const faceAnalyzerData: CreateFaceAnalyzerRequest = {
                        facePhotoEyebrowDoubleBase64: base64WithEyebrow.split(',')[1],
                        facePhotoEyebrowSingleBase64: base64RemoveEyebrow.split(',')[1],
                        facePoint: Number(Number(analysisData?.your_face_ratio || 0).toFixed(3)),
                        faceType: analysisData?.face_shape?.shape || 'Unknown',
                        faceId: Number(faceId)
                    }
                    await createFaceAnalyzerMutation.mutateAsync(faceAnalyzerData)

                    toast.success('Lưu thông tin khách hàng thành công')
                    queryClient.invalidateQueries({ queryKey: ['AI_FACE_LIST'] })
                    queryClient.invalidateQueries({ queryKey: ['CRM_CUSTOMER_LIST'] })
                    queryClient.invalidateQueries({ queryKey: ['getAIFace', faceId] })

                    if (!disableNavigate) {
                        navigate('/ai-face-analyzer-list')
                    }
                } else {
                    // Outside ai-face-analyzer: just acknowledge save
                    toast.success('Lưu thông tin khách hàng thành công')
                    queryClient.invalidateQueries({ queryKey: ['CRM_CUSTOMER_LIST'] })
                }

                handleDialogClose()
                if (typeof onSave === 'function') onSave()
            }
        } catch (error) {
            console.error('Error saving customer:', error)
            toast.error('Không thể lưu thông tin khách hàng. Vui lòng thử lại')
        } finally {
            setIsLoadingSave(false)
        }
    }, [
        analysisData?.face_shape?.shape,
        analysisData?.your_face_ratio,
        base64RemoveEyebrow,
        base64WithEyebrow,
        createFaceAnalyzerMutation,
        createCustomerMutation,
        disableNavigate,
        customerId,
        faceId,
        hasAttachedCustomer,
        handleDialogClose,
        isNewCustomer,
        navigate,
        onSave,
        updateFaceAIMutation
    ])

    // Memoized headers to avoid re-creating elements unnecessarily
    const headerContent = useMemo(
        () => (
            <div className='bg-indigo-50 border-b border-gray-200 py-3 flex justify-between items-center'>
                <div className='flex items-center gap-2'>
                    <h2 className='text-[15px] font-medium px-3'>Lưu thông tin khách khàng</h2>
                </div>

                <div className='flex gap-2'>
                    <button
                        onClick={handleDialogClose}
                        className='cursor-pointer px-3 py-1.5 bg-gray-100 text-gray-700 text-[13px] hover:bg-gray-200 transition rounded'
                    >
                        Huỷ
                    </button>
                    <button
                        onClick={handleSave}
                        className='cursor-pointer px-3 py-1.5 bg-gradient-to-br from-green-400 to-blue-600 text-white text-[13px] hover:bg-indigo-700 transition rounded flex items-center gap-2 disabled:opacity-70 disabled:pointer-events-none'
                        disabled={isLoadingSave || (!hasAttachedCustomer && !isFormReady)}
                    >
                        {isLoadingSave ? (
                            <>
                                <svg
                                    className='animate-spin h-3 w-3 text-white'
                                    xmlns='http://www.w3.org/2000/svg'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                >
                                    <circle
                                        className='opacity-25'
                                        cx='12'
                                        cy='12'
                                        r='10'
                                        stroke='currentColor'
                                        strokeWidth='4'
                                    ></circle>
                                    <path
                                        className='opacity-75'
                                        fill='currentColor'
                                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                    ></path>
                                </svg>
                                <span>Đang lưu...</span>
                            </>
                        ) : (
                            <span>{hasAttachedCustomer ? 'Lưu kết quả' : 'Lưu thông tin'}</span>
                        )}
                    </button>
                </div>
            </div>
        ),
        [handleDialogClose, handleSave, isLoadingSave, isFormReady, hasAttachedCustomer]
    )

    return (
        <Dialog
            visible={visible}
            onHide={handleDialogClose}
            header={headerContent}
            className='w-full max-w-[500px] h-auto bg-white'
            contentClassName='p-0  overflow-hidden flex flex-col'
            headerClassName='p-0'
            draggable={false}
            resizable={false}
            dismissableMask
            blockScroll
            closable={false}
        >
            <FormCustomers
                ref={formRef}
                onSubmit={handleFormSubmit}
                isNewCustomer={isNewCustomer}
                setIsNewCustomer={setIsNewCustomer}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                preSelectedCustomerId={customerId}
                onValidityChange={setIsFormReady}
            />
        </Dialog>
    )
}
