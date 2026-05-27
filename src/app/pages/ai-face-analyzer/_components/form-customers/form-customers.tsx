import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery } from '@tanstack/react-query'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { FormProvider, Resolver, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { queryClient } from '../../../../../main'
import { beautyApi } from '../../../../apis/beauty.api'
import { customerFormSchema } from '../../../../schemas/customer.schema'
import { CustomerResponse, UpdateCustomerRequest } from '../../../../types/beauty.type'
import './form-customers.css'

// Import components
import CustomerForm from './customer-form'
import { useSearchParams } from 'react-router-dom'

/**
 * Định nghĩa cấu trúc dữ liệu form đơn giản cho khách hàng
 */
export interface FormData {
    customer: CustomerResponse | null
    firstName: string
    lastName: string
    fullName: string
    telContact: string
    address: string
    gender: boolean
    birthday?: number
    partnerId?: number
    isNewCustomer: boolean
}

/**
 * Props cho component FormCustomers
 */
interface FormCustomersProps {
    onSubmit: (data: FormData) => void
    isNewCustomer: boolean
    setIsNewCustomer: (value: boolean) => void
    isEditing: boolean
    setIsEditing: (value: boolean) => void
    preSelectedCustomerId?: number
    onValidityChange?: (isValid: boolean) => void
}

/**
 * Interface để expose các phương thức từ form ra component cha
 */
export interface FormCustomersRef {
    submitForm: () => void
    getFormValues: () => FormData
    selectCustomerById: (customerId: number) => void
}

/**
 * Form đơn giản để quản lý thông tin khách hàng
 * Chỉ tập trung vào tìm kiếm, tạo mới và chỉnh sửa khách hàng
 */
const FormCustomers = forwardRef<FormCustomersRef, FormCustomersProps>(
    ({ onSubmit, isNewCustomer, setIsNewCustomer, isEditing, setIsEditing, preSelectedCustomerId, onValidityChange }, ref) => {
        // States cho tìm kiếm và hiển thị khách hàng
        const [searchParams] = useSearchParams()
        const faceId = searchParams.get('faceId')
        const [showSearchResults, setShowSearchResults] = useState(false)
        const [searchTerm, setSearchTerm] = useState('')
        const [formMode, setFormMode] = useState<'search' | 'view' | 'edit' | 'add'>('search')
        const [selectedCustomer, setSelectedCustomer] = useState<CustomerResponse | null>(null)

        // Fetch customers
        const { data: customers, refetch: refetchCustomers } = useQuery({
            queryKey: ['CRM_CUSTOMER_LIST'],
            queryFn: beautyApi.getAllCustomer
        })

        const { data: getAIFace } = useQuery({
            queryKey: ['getAIFace', faceId],
            queryFn: () => beautyApi.getFaceAIById(faceId || ''),
            enabled: !!faceId
        })

        console.log('getAIFace', getAIFace)

        // Prefill form from AI Face customer (no need to find from list)

        // Setup react-hook-form with validation
        const methods = useForm<FormData>({
            defaultValues: {
                customer: null,
                firstName: '',
                lastName: '',
                fullName: '',
                telContact: '',
                address: '',
                gender: true,
                birthday: 0,
                partnerId: undefined,
                isNewCustomer: false
            },
            resolver: yupResolver(customerFormSchema) as unknown as Resolver<FormData>,
            mode: 'onChange',
            reValidateMode: 'onChange'
        })

        const {
            handleSubmit,
            reset,
            setValue,
            watch,
            trigger,
            formState: { errors }
        } = methods

        // Prefill form from AI Face customer (no need to find from list)
        useEffect(() => {
            const aiCustomer = getAIFace?.data?.data?.customer as unknown as Partial<CustomerResponse> | undefined
            if (!aiCustomer) return

            setValue('customer', aiCustomer as CustomerResponse)
            setValue('firstName', aiCustomer.firstName || '')
            setValue('lastName', aiCustomer.lastName || '')
            setValue('fullName', `${aiCustomer.lastName || ''} ${aiCustomer.firstName || ''}`.trim())
            setValue('telContact', aiCustomer.telContact || '')
            setValue('address', aiCustomer.address || '')
            setValue('gender', aiCustomer.gender ?? true)
            setValue('birthday', aiCustomer.birthday ?? 0)
            setValue('partnerId', aiCustomer.partnerId ?? aiCustomer.partnerCatalog?.id ?? undefined)

            // Mark as selected and lock the form (disable inputs) immediately
            try {
                setSelectedCustomer(aiCustomer as unknown as CustomerResponse)
            } catch {
                // ignore casting differences
            }
            setFormMode('view')
            setIsNewCustomer(false)
            setIsEditing(false)
            setSearchTerm('')
            setShowSearchResults(false)
        }, [getAIFace, setValue, setIsNewCustomer, setIsEditing])

        // Watch for fullName changes
        const fullName = watch('fullName')

        // When fullName changes, update firstName and lastName
        useEffect(() => {
            if (fullName) {
                const nameParts = fullName.trim().split(' ')
                if (nameParts.length > 0) {
                    const lastName = nameParts[nameParts.length - 1]
                    const firstName = nameParts.slice(0, nameParts.length - 1).join(' ')
                    setValue('firstName', firstName)
                    setValue('lastName', lastName)
                }
            }
        }, [fullName, setValue])

        // Form submission
        const onFormSubmit = (data: FormData) => {
            console.log('===== CUSTOMER FORM SUBMIT =====', data)

            // Ensure firstName and lastName are populated from fullName if needed
            if (data.fullName && (!data.firstName || !data.lastName)) {
                const nameParts = data.fullName.trim().split(' ')
                if (nameParts.length > 0) {
                    data.firstName = nameParts[nameParts.length - 1]
                    data.lastName = nameParts.slice(0, nameParts.length - 1).join(' ')
                }
            }

            console.log('Final customer data:', {
                customer: data.customer,
                firstName: data.firstName,
                lastName: data.lastName,
                telContact: data.telContact,
                address: data.address,
                gender: data.gender,
                birthday: data.birthday,
                isNewCustomer: data.isNewCustomer
            })

            onSubmit(data)
            refetchCustomers()
        }

        // Validate and submit form
        const validateAndSubmit = async () => {
            console.log('===== VALIDATE AND SUBMIT CALLED =====')

            const fieldsToValidate = ['fullName', 'telContact', 'partnerId'] as const

            console.log('Fields to validate:', fieldsToValidate, 'isNewCustomer:', isNewCustomer)

            const isValid = await trigger(fieldsToValidate, { shouldFocus: true })
            console.log('Validation result:', isValid)

            if (isValid) {
                console.log('Form is valid, submitting...')
                handleSubmit(onFormSubmit)()
            } else {
                console.log('Form validation failed')
            }
        }

        // Expose methods to parent component
        useImperativeHandle(ref, () => ({
            submitForm: validateAndSubmit,
            getFormValues: () => {
                const formValues = watch()

                if (formMode === 'add' || isNewCustomer) {
                    const fullName = formValues.fullName || ''
                    if (fullName && (!formValues.firstName || !formValues.lastName)) {
                        const nameParts = fullName.trim().split(' ')
                        if (nameParts.length > 0) {
                            const firstName = nameParts[nameParts.length - 1]
                            const lastName = nameParts.slice(0, nameParts.length - 1).join(' ')
                            formValues.firstName = firstName
                            formValues.lastName = lastName
                        }
                    }

                    if (formValues.gender === undefined) {
                        formValues.gender = true
                    }
                }

                return formValues
            },
            selectCustomerById: (customerId: number) => {
                console.log('selectCustomerById called with ID:', customerId)
                if (!customers?.data?.data) {
                    console.error('No customers available yet - cannot select customer by ID')
                    return
                }

                const customer = customers.data.data.find((c) => c.id === customerId)
                if (customer) {
                    console.log('Found customer:', customer)
                    setSelectedCustomer(customer)
                    setValue('customer', customer)
                    setValue('firstName', customer.firstName || '')
                    setValue('lastName', customer.lastName || '')
                    setValue('fullName', `${customer.lastName || ''} ${customer.firstName || ''}`.trim())
                    setValue('telContact', customer.telContact || '')
                    setValue('address', customer.address || '')
                    setValue('gender', customer.gender !== undefined ? customer.gender : true)
                    setValue('birthday', customer.birthday || 0)
                    // Set partnerId from customer's partner info if available
                    setValue('partnerId', customer.partnerId || customer.partnerCatalog?.id || undefined)
                    setFormMode('view')
                    setIsNewCustomer(false)
                    console.log('Selected customer via selectCustomerById:', customer)
                    console.log('Partner info:', customer.partnerCatalog)
                } else {
                    console.error('Customer with ID', customerId, 'not found')
                }
            }
        }))

        // Live required fields validity (fullName, telContact, partnerId)
        useEffect(() => {
            const subscription = methods.watch((value) => {
                const nameOk = (value.fullName || '').toString().trim().length > 0
                const tel = (value.telContact || '').toString().trim()
                const telOk = /^\+?\d{8,15}$/.test(tel)
                const partnerOk = typeof value.partnerId === 'number' && !Number.isNaN(value.partnerId)
                const isValid = Boolean(nameOk && telOk && partnerOk)
                if (typeof onValidityChange === 'function') onValidityChange(isValid)
            })
            return () => subscription.unsubscribe()
        }, [methods, onValidityChange])

        // Update isNewCustomer context when it changes
        useEffect(() => {
            setValue('isNewCustomer', isNewCustomer)
            reset(
                {
                    ...watch(),
                    isNewCustomer
                },
                {
                    keepValues: true,
                    keepDirtyValues: true,
                    keepErrors: false
                }
            )
        }, [isNewCustomer, setValue, reset, watch])

        // Update form fields when a customer is selected
        useEffect(() => {
            if (selectedCustomer && !isNewCustomer) {
                setValue('customer', selectedCustomer)
                setValue('firstName', selectedCustomer.firstName || '')
                setValue('lastName', selectedCustomer.lastName || '')
                setValue('fullName', `${selectedCustomer.lastName || ''} ${selectedCustomer.firstName || ''}`.trim())
                setValue('telContact', selectedCustomer.telContact || '')
                setValue('address', selectedCustomer.address || '')
                setValue('gender', selectedCustomer.gender !== undefined ? selectedCustomer.gender : true)
                setValue('birthday', selectedCustomer.birthday || 0)
                // Set partnerId from customer's partner info
                const partnerId = selectedCustomer.partnerId || selectedCustomer.partnerCatalog?.id
                setValue('partnerId', partnerId || undefined)
                setFormMode('view')
                console.log('Updated form with selectedCustomer partnerId:', partnerId)
            } else if (isNewCustomer) {
                setFormMode('add')
            }
        }, [selectedCustomer, isNewCustomer, setValue])

        // Start new customer entry
        const handleNewCustomer = (e: React.MouseEvent) => {
            e.preventDefault()
            setIsNewCustomer(true)
            setIsEditing(false)
            setSelectedCustomer(null)
            setValue('customer', null)
            setValue('firstName', '')
            setValue('lastName', '')
            setValue('fullName', '')
            setValue('telContact', '')
            setValue('address', '')
            setValue('birthday', 0)
            setValue('partnerId', undefined)
            setFormMode('add')

            reset(
                {
                    customer: null,
                    firstName: '',
                    lastName: '',
                    fullName: '',
                    telContact: '',
                    address: '',
                    partnerId: undefined,
                    isNewCustomer: true
                },
                {
                    keepErrors: false
                }
            )
        }

        // Toggle edit mode
        const toggleEdit = () => {
            setIsEditing(!isEditing)
            setFormMode(isEditing ? 'view' : 'edit')

            // When entering edit mode, ensure partnerId is set from selectedCustomer
            if (!isEditing && selectedCustomer) {
                const partnerId = selectedCustomer.partnerId || selectedCustomer.partnerCatalog?.id
                if (partnerId) {
                    setValue('partnerId', partnerId)
                    console.log('Set partnerId from selectedCustomer:', partnerId)
                }
            }
        }

        // Cancel editing
        const cancelEdit = () => {
            console.log('Canceling edit, current mode:', formMode, 'selected customer:', selectedCustomer)

            if (formMode === 'edit' && selectedCustomer) {
                setValue('firstName', selectedCustomer.firstName || '')
                setValue('lastName', selectedCustomer.lastName || '')
                setValue('fullName', `${selectedCustomer.lastName || ''} ${selectedCustomer.firstName || ''}`.trim())
                setValue('telContact', selectedCustomer.telContact || '')
                setValue('address', selectedCustomer.address || '')
                setValue('birthday', selectedCustomer.birthday || 0)
                // Reset partnerId to original value
                const partnerId = selectedCustomer.partnerId || selectedCustomer.partnerCatalog?.id
                setValue('partnerId', partnerId || undefined)

                setFormMode('view')
                setIsEditing(false)
                console.log('Returned to view mode with customer:', selectedCustomer)
            } else if (formMode === 'add') {
                setFormMode('search')
                setIsNewCustomer(false)
                setSelectedCustomer(null)
                setValue('customer', null)
                setValue('firstName', '')
                setValue('lastName', '')
                setValue('fullName', '')
                setValue('telContact', '')
                setValue('address', '')
                setValue('birthday', 0)
                setValue('partnerId', undefined)
                console.log('Canceled adding new customer, returned to search mode')
            }
        }

        // Reset customer selection
        const handleResetCustomer = () => {
            setSelectedCustomer(null)
            setValue('customer', null)
            setValue('firstName', '')
            setValue('lastName', '')
            setValue('fullName', '')
            setValue('telContact', '')
            setValue('address', '')
            setValue('gender', true)
            setValue('birthday', 0)
            setValue('partnerId', undefined)

            setFormMode('search')
            setIsEditing(false)
            setIsNewCustomer(false)

            console.log('Reset customer selection, returned to search mode')
        }

        // Handle phone input change for customer search
        const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value

            if ((formMode === 'view' || formMode === 'edit') && !searchTerm && selectedCustomer) {
                setValue('telContact', inputValue)
                return
            }

            setSearchTerm(inputValue)
            setValue('telContact', inputValue)

            if (inputValue.length > 0) {
                const hasMatches = customers?.data?.data
                    ? customers.data.data.some((c) => c.telContact?.toLowerCase().includes(inputValue.toLowerCase()))
                    : false

                setShowSearchResults(hasMatches)

                if (formMode === 'view' && searchTerm !== inputValue) {
                    setSelectedCustomer(null)
                    setValue('customer', null)
                    setValue('fullName', '')
                    setValue('address', '')
                    setValue('gender', true)
                    setFormMode('search')
                    console.log('Switching to search mode from view mode')
                }

                if (!hasMatches && formMode !== 'edit') {
                    setFormMode('add')
                    setIsNewCustomer(true)
                    console.log('No matches found, switching to add mode')
                } else if (formMode !== 'edit' && hasMatches) {
                    setFormMode('search')
                    setIsNewCustomer(false)
                    console.log('Matches found, switching to search mode')
                }
            } else {
                setShowSearchResults(false)

                if (formMode !== 'edit') {
                    setSelectedCustomer(null)
                    setValue('customer', null)
                    setValue('fullName', '')
                    setValue('address', '')
                    setFormMode('search')
                    console.log('Cleared phone field, switching to search mode')
                }
            }
        }

        // Clear search
        const clearSearch = () => {
            setSearchTerm('')
            setShowSearchResults(false)

            if (formMode !== 'edit' && formMode !== 'view') {
                setSelectedCustomer(null)
                setValue('customer', null)
                setValue('fullName', '')
                setValue('address', '')
                setFormMode('search')
            }
        }

        // Create customer options for the dropdown
        const customerOptions = useMemo(() => {
            if (!customers?.data?.data) return []

            const filteredCustomers = searchTerm
                ? customers.data.data.filter((c) => c.telContact?.toLowerCase().includes(searchTerm.toLowerCase()))
                : customers.data.data

            return filteredCustomers.map((customer) => ({
                label: `${customer.telContact || ''} - ${customer.lastName || ''} ${customer.firstName || ''}`,
                value: String(customer.id),
                customer
            }))
        }, [customers, searchTerm])

        // Handle selecting a customer from search results
        const handleSearchCustomerSelect = (customerId: string) => {
            console.log('Selecting customer with ID:', customerId)
            const customer = customers?.data?.data?.find((c) => c.id === Number(customerId))

            if (customer) {
                setValue('customer', customer)
                setValue('telContact', customer.telContact || '')
                setValue('fullName', `${customer.lastName || ''} ${customer.firstName || ''}`.trim())
                setValue('address', customer.address || '')
                setValue('gender', customer.gender !== undefined ? customer.gender : true)
                setValue('birthday', customer.birthday || 0)
                // Set partnerId from customer's partner info if available
                setValue('partnerId', customer.partnerId || customer.partnerCatalog?.id || undefined)

                if (customer.birthday && typeof customer.birthday === 'string') {
                    toast.warning('Ngày sinh của khách hàng không đúng định dạng, vui lòng cập nhật')
                }

                setFormMode('view')
                setIsNewCustomer(false)
                setSelectedCustomer(customer)

                console.log('Selected customer:', customer)
                console.log('Partner info:', customer.partnerCatalog)
            }

            setShowSearchResults(false)
            setSearchTerm('')
        }

        // Update customer mutation
        const updateCustomerMutation = useMutation({
            mutationFn: (body: UpdateCustomerRequest) => beautyApi.updateCustomer(body),
            onSuccess: () => {
                toast.success('Cập nhật thông tin khách hàng thành công')
                setIsEditing(false)
                setFormMode('view')
                refetchCustomers()
                queryClient.invalidateQueries({ queryKey: ['CRM_CUSTOMER_LIST'] })
            },
            onError: () => {
                toast.error('Cập nhật thông tin khách hàng thất bại')
            }
        })

        // Handle update customer
        const handleUpdateCustomer = () => {
            const aiFaceCustomerId = getAIFace?.data?.data?.customerId ?? getAIFace?.data?.data?.customer?.id
            const effectiveCustomerId = selectedCustomer?.id ?? aiFaceCustomerId

            if (!effectiveCustomerId) {
                toast.error('Không tìm thấy ID khách hàng')
                return
            }

            const currentFullName = watch('fullName')
            if (currentFullName && (!watch('firstName') || !watch('lastName'))) {
                const nameParts = currentFullName.trim().split(' ')
                if (nameParts.length > 0) {
                    setValue('firstName', nameParts[nameParts.length - 1])
                    setValue('lastName', nameParts.slice(0, nameParts.length - 1).join(' '))
                }
            }

            const formData = {
                customerId: effectiveCustomerId,
                firstName: watch('firstName'),
                lastName: watch('lastName'),
                telContact: watch('telContact'),
                address: watch('address'),
                birthday: watch('birthday')
            }

            updateCustomerMutation.mutate(formData)
        }

        // Handle pre-selected customer ID (from modal)
        const [hasProcessedCustomerId, setHasProcessedCustomerId] = useState(false)
        const processedCustomerIdRef = useRef<number | undefined>(undefined)
        const prevPreSelectedCustomerIdRef = useRef<number | undefined>(undefined)

        useEffect(() => {
            if (prevPreSelectedCustomerIdRef.current !== preSelectedCustomerId) {
                console.log(
                    'preSelectedCustomerId changed from:',
                    prevPreSelectedCustomerIdRef.current,
                    'to:',
                    preSelectedCustomerId
                )
                prevPreSelectedCustomerIdRef.current = preSelectedCustomerId
            }

            if (
                preSelectedCustomerId &&
                (!hasProcessedCustomerId || processedCustomerIdRef.current !== preSelectedCustomerId) &&
                customers?.data?.data
            ) {
                console.log('Tìm kiếm khách hàng với ID:', preSelectedCustomerId)

                const customer = customers.data.data.find((c) => c.id === preSelectedCustomerId)
                console.log('Tìm thấy khách hàng:', customer)

                if (customer) {
                    console.log('Tự động chọn khách hàng:', customer)
                    setSelectedCustomer(customer)
                    setValue('customer', customer)
                    setValue('firstName', customer.firstName || '')
                    setValue('lastName', customer.lastName || '')
                    setValue('fullName', `${customer.lastName || ''} ${customer.firstName || ''}`.trim())
                    setValue('telContact', customer.telContact || '')
                    setValue('address', customer.address || '')
                    setValue('gender', customer.gender !== undefined ? customer.gender : true)
                    setValue('birthday', customer.birthday || 0)
                    // Set partnerId from customer's partner info if available
                    setValue('partnerId', customer.partnerId || customer.partnerCatalog?.id || undefined)

                    setFormMode('view')
                    setIsNewCustomer(false)

                    console.log('Đã chọn khách hàng từ preSelectedCustomerId:', preSelectedCustomerId)
                    console.log('Partner info:', customer.partnerCatalog)

                    setHasProcessedCustomerId(true)
                    processedCustomerIdRef.current = preSelectedCustomerId
                }
            } else if (!preSelectedCustomerId && processedCustomerIdRef.current !== undefined) {
                console.log(
                    'preSelectedCustomerId đã thay đổi từ',
                    processedCustomerIdRef.current,
                    'thành undefined, đặt lại trạng thái xử lý'
                )
                setHasProcessedCustomerId(false)
                processedCustomerIdRef.current = undefined
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [preSelectedCustomerId, customers, setValue, hasProcessedCustomerId])

        return (
            <FormProvider {...methods}>
                <div className='flex flex-col overflow-hidden'>
                    <div className='w-full h-full overflow-hidden'>
                        <CustomerForm
                            formMode={formMode}
                            searchTerm={searchTerm}
                            showSearchResults={showSearchResults}
                            customerOptions={customerOptions}
                            errors={errors}
                            isEditing={isEditing}
                            selectedCustomer={selectedCustomer}
                            handlePhoneInputChange={handlePhoneInputChange}
                            clearSearch={clearSearch}
                            handleSearchCustomerSelect={handleSearchCustomerSelect}
                            toggleEdit={toggleEdit}
                            handleUpdateCustomer={handleUpdateCustomer}
                            cancelEdit={cancelEdit}
                            handleNewCustomer={handleNewCustomer}
                            handleResetCustomer={handleResetCustomer}
                            isLoadingPreviousBookings={false}
                        />
                    </div>
                </div>
            </FormProvider>
        )
    }
)

FormCustomers.displayName = 'FormCustomers'

export default FormCustomers
