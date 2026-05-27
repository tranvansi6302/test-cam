import { useQuery } from '@tanstack/react-query'
import { Dropdown } from 'primereact/dropdown'
import { Controller, FieldErrors, useFormContext } from 'react-hook-form'
// import { toast } from 'react-toastify'
import { beautyApi } from '../../../../apis/beauty.api'
import { CustomerResponse } from '../../../../types/beauty.type'

// Define custom FormData interface
interface FormData {
    telContact: string
    fullName: string
    address: string
    gender: boolean
    birthday: string | number
    partnerId?: number
}

/**
 * Props cho component CustomerForm
 * @prop formMode - Chế độ hiển thị form: tìm kiếm, xem, chỉnh sửa hoặc thêm mới
 * @prop searchTerm - Chuỗi tìm kiếm hiện tại
 * @prop showSearchResults - Cờ hiển thị kết quả tìm kiếm
 * @prop customerOptions - Danh sách khách hàng tìm thấy
 * @prop errors - Lỗi từ react-hook-form
 * @prop isEditing - Trạng thái đang chỉnh sửa
 * @prop selectedCustomer - Khách hàng đang được chọn
 * @prop handlePhoneInputChange - Xử lý khi số điện thoại thay đổi
 * @prop clearSearch - Xóa kết quả tìm kiếm
 * @prop handleSearchCustomerSelect - Xử lý khi chọn khách hàng từ kết quả tìm kiếm
 * @prop toggleEdit - Bật/tắt chế độ chỉnh sửa
 * @prop handleUpdateCustomer - Xử lý cập nhật thông tin khách hàng
 * @prop cancelEdit - Hủy thao tác chỉnh sửa
 * @prop handleNewCustomer - Xử lý thêm khách hàng mới
 * @prop handleResetCustomer - Xử lý reset lựa chọn khách hàng hiện tại
 * @prop isLoadingPreviousBookings - Trạng thái đang tải dịch vụ trước đó của khách hàng
 */
interface CustomerFormProps {
    formMode: 'search' | 'view' | 'edit' | 'add'
    searchTerm: string
    showSearchResults: boolean
    customerOptions: Array<{
        label: string
        value: string
        customer: CustomerResponse
    }>
    errors: FieldErrors<FormData>
    isEditing: boolean
    selectedCustomer: CustomerResponse | null
    handlePhoneInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    clearSearch: () => void
    handleSearchCustomerSelect: (customerId: string) => void
    toggleEdit: () => void
    handleUpdateCustomer: () => void
    cancelEdit: () => void
    handleNewCustomer: (e: React.MouseEvent) => void
    handleResetCustomer: () => void
    isLoadingPreviousBookings: boolean
}

/**
 * Component chứa form thông tin khách hàng
 * Hiển thị và quản lý thông tin cơ bản của khách hàng (SĐT, họ tên, địa chỉ)
 * Cung cấp các chức năng: tìm kiếm, thêm mới, sửa, chọn lại khách hàng
 */
const CustomerForm = ({
    formMode,
    // searchTerm,
    showSearchResults,
    customerOptions,
    errors,
    isEditing,
    selectedCustomer,
    handlePhoneInputChange,
    // clearSearch,
    handleSearchCustomerSelect,
    toggleEdit,
    handleUpdateCustomer,
    // cancelEdit,
    handleResetCustomer
}: CustomerFormProps) => {
    // Sử dụng react-hook-form context để truy cập các phương thức form
    const { control, trigger } = useFormContext<FormData>()

    // Dữ liệu cứng cho Dành cho
    const { data: partnerList } = useQuery({
        queryKey: ['CRM_PARTNER_LIST'],
        queryFn: beautyApi.getAllPartner
    })

    const referrerOptions = partnerList?.data?.data?.map((partner) => ({
        label: partner.partnerName + ' (' + partner.partnerCode + ')',
        value: partner.id
    }))

    return (
        <div className='mb-4 overflow-hidden overflow-y-hidden'>
            {/* Tiêu đề form */}
            <div className='flex items-start mb-2 justify-start text-left'>
                <span className='text-sm font-medium pt-2'>Thông tin khách hàng</span>
            </div>

            {/* Hiển thị thông báo khi chưa chọn khách hàng */}
            {formMode === 'search' && !selectedCustomer ? (
                <div className='bg-red-50 text-red-700 text-xs italic p-2 rounded shadow-sm mb-3 flex items-center'>
                    <i className='ri-user-search-line mr-1.5 text-sm'></i>
                    Hãy điền thông tin khách hàng
                </div>
            ) : null}

            {/* Hiển thị thông báo khi đang trong chế độ thêm mới */}
            {formMode === 'add' && (
                <div className='bg-green-50 text-green-700 text-xs italic p-2 rounded shadow-sm mb-3 flex items-center'>
                    <i className='ri-user-add-line mr-1.5 text-sm'></i>
                    Đang thêm khách hàng mới - Vui lòng điền đầy đủ thông tin
                </div>
            )}

            <div className='flex flex-col gap-2'>
                {/* Trường nhập số điện thoại với chức năng tìm kiếm */}
                <div className='relative'>
                    <Controller
                        name='telContact'
                        control={control}
                        render={({ field }) => (
                            <>
                                <label htmlFor='telContact' className='text-xs text-gray-700 mb-1 block'>
                                    Số điện thoại <span className='text-red-500'>*</span>
                                </label>
                                <input
                                    id='telContact'
                                    value={field.value}
                                    onChange={(e) => {
                                        field.onChange(e)
                                        handlePhoneInputChange(e)
                                    }}
                                    className={`w-full border border-gray-300 rounded-md text-xs p-2 h-8 focus:ring-1 focus:ring-green-500 focus:border-green-500 transition ${
                                        errors.telContact ? 'border-red-500' : ''
                                    } ${
                                        formMode === 'view' || formMode === 'edit'
                                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                            : ''
                                    }`}
                                    disabled={formMode === 'view' || formMode === 'edit'}
                                    placeholder='Số điện thoại'
                                />
                                {errors.telContact && (
                                    <div className='text-red-500 text-left text-xs mt-1'>
                                        {errors.telContact.message as string}
                                    </div>
                                )}
                            </>
                        )}
                    />
                    {/* Nút xóa từ khóa tìm kiếm */}
                    {/* {searchTerm && (
                        <button
                            className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
                            onClick={clearSearch}
                        >
                            <X size={14} />
                        </button>
                    )} */}

                    {/* Dropdown hiển thị kết quả tìm kiếm khách hàng */}
                    <div
                        className={`absolute top-full left-0 w-full z-10 mt-1 bg-white shadow-lg rounded-md max-h-32 overflow-y-auto transition-opacity ${
                            showSearchResults && customerOptions.length > 0 ? 'opacity-100' : 'hidden opacity-0'
                        }`}
                    >
                        {customerOptions.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => handleSearchCustomerSelect(option.value)}
                                className='p-2 cursor-pointer border-b border-gray-200 text-xs hover:bg-gray-50'
                            >
                                {option.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trường nhập họ tên khách hàng */}
                <Controller
                    name='fullName'
                    control={control}
                    render={({ field }) => (
                        <div>
                            <label htmlFor='fullName' className='text-xs text-gray-700 mb-1 block'>
                                Tên khách hàng <span className='text-red-500'>*</span>
                            </label>
                            <input
                                id='fullName'
                                value={field.value}
                                onChange={(e) => {
                                    field.onChange(e.target.value)
                                    trigger('fullName') // Kích hoạt validation ngay khi nhập
                                }}
                                className={`w-full border border-gray-300 rounded-md text-xs p-2 h-8 focus:ring-1 focus:ring-green-500 focus:border-green-500 transition ${
                                    errors.fullName ? 'border-red-500' : ''
                                }`}
                                disabled={formMode === 'view' && !isEditing}
                                placeholder='Tên khách hàng'
                            />
                            {errors.fullName && (
                                <div className='text-red-500 text-left text-xs mt-1'>{errors.fullName.message as string}</div>
                            )}
                        </div>
                    )}
                />

                {/* Trường nhập địa chỉ khách hàng */}
                <Controller
                    name='address'
                    control={control}
                    render={({ field }) => (
                        <div>
                            <label htmlFor='fullName' className='text-xs text-gray-700 mb-1 block'>
                                Địa chỉ
                            </label>
                            <input
                                id='address'
                                value={field.value}
                                onChange={(e) => {
                                    field.onChange(e.target.value)
                                    trigger('address') // Kích hoạt validation ngay khi nhập
                                }}
                                className={`w-full border border-gray-300 rounded-md text-xs p-2 h-8 focus:ring-1 focus:ring-green-500 focus:border-green-500 transition ${
                                    errors.address ? 'border-red-500' : ''
                                }`}
                                disabled={formMode === 'view' && !isEditing}
                                placeholder='Địa chỉ'
                            />
                        </div>
                    )}
                />

                {/* Trường chọn giới tính */}
                <div className='flex gap-4 items-center mt-1 mb-1'>
                    {/* Giới tính */}
                    <Controller
                        name='gender'
                        control={control}
                        render={({ field }) => (
                            <div className='flex items-center'>
                                <span className='text-xs text-gray-600 mr-3'>Giới tính:</span>
                                <div className='flex items-center space-x-3'>
                                    <div className='flex items-center'>
                                        <input
                                            id='gender-female'
                                            type='radio'
                                            className='w-3.5 h-3.5 text-pink-600 cursor-pointer'
                                            checked={field.value === true}
                                            onChange={() => field.onChange(true)}
                                            disabled={formMode === 'view' && !isEditing}
                                        />
                                        <label
                                            htmlFor='gender-female'
                                            className='ml-1.5 text-xs text-gray-700 cursor-pointer select-none'
                                        >
                                            Nữ
                                        </label>
                                    </div>
                                    <div className='flex items-center'>
                                        <input
                                            id='gender-male'
                                            type='radio'
                                            className='w-3.5 h-3.5 text-blue-600 cursor-pointer'
                                            checked={field.value === false}
                                            onChange={() => field.onChange(false)}
                                            disabled={formMode === 'view' && !isEditing}
                                        />
                                        <label
                                            htmlFor='gender-male'
                                            className='ml-1.5 text-xs text-gray-700 cursor-pointer select-none'
                                        >
                                            Nam
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    />

                    {/* Ẩn bỏ ngày sinh theo yêu cầu */}
                </div>

                {/* Trường chọn Dành cho */}
                <Controller
                    name='partnerId'
                    control={control}
                    render={({ field }) => (
                        <div className='flex flex-col items-start justify-start mt-1 mb-1'>
                            <label htmlFor='partnerId' className='text-xs text-gray-700 mb-1 block'>
                                Dành cho <span className='text-red-500'>*</span>
                            </label>
                            <Dropdown
                                value={field.value}
                                onChange={(e) => field.onChange(e.value)}
                                options={referrerOptions || []}
                                placeholder='Chọn'
                                className={`w-full text-xs ${errors.partnerId ? 'border-red-500' : ''}`}
                                disabled={formMode === 'view' && !isEditing}
                                style={{ height: '32px', fontSize: '12px' }}
                            />
                            {/* Hiển thị lỗi validation cho Dành cho */}
                            {errors.partnerId && (
                                <div className='text-red-500 text-left text-xs mt-1'>{errors.partnerId.message}</div>
                            )}
                        </div>
                    )}
                />

                {/* Hiển thị thông tin Dành cho đã chọn */}

                {/* Các nút tác vụ */}
                <div className='flex gap-2 mt-1 justify-end'>
                    {/* Nút sửa/lưu: hiển thị khác nhau tùy vào trạng thái */}
                    <button
                        type='button'
                        className={`cursor-pointer bg-gradient-to-r from-green-500 via-green-600 to-green-500 text-white text-xs px-3 py-1 rounded h-[30px] flex items-center ${
                            formMode === 'view' || formMode === 'edit' ? '' : 'opacity-50'
                        }`}
                        onClick={formMode === 'edit' ? handleUpdateCustomer : toggleEdit}
                        disabled={formMode !== 'view' && formMode !== 'edit'}
                    >
                        <i className={`${formMode === 'edit' ? 'ri-save-line mr-1' : 'ri-edit-line mr-1'}`}></i>
                        {formMode === 'edit' ? 'Lưu lại' : 'Sửa thông tin'}
                    </button>

                    {/* Nút hủy: hủy bỏ thao tác chỉnh sửa hoặc thêm mới */}
                    {/* <button
                        type='button'
                        className={`cursor-pointer bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded h-[30px] flex items-center ${
                            formMode === 'edit' || formMode === 'add' ? '' : 'opacity-50'
                        }`}
                        onClick={cancelEdit}
                        disabled={formMode !== 'edit' && formMode !== 'add'}
                    >
                        <i className='ri-close-line mr-1'></i>
                        Hủy
                    </button> */}

                    {/* Nút chọn lại: cho phép người dùng chọn lại khách hàng khác */}
                    {formMode === 'view' && selectedCustomer && (
                        <button
                            type='button'
                            className='cursor-pointer bg-blue-600 text-white text-xs px-3 py-1 rounded h-[30px] flex items-center'
                            onClick={handleResetCustomer}
                        >
                            <i className='ri-refresh-line mr-1'></i>
                            Chọn lại
                        </button>
                    )}

                    {/* Nút thêm mới: hiển thị khi đang ở chế độ tìm kiếm và chưa chọn khách hàng nào */}
                </div>
            </div>
        </div>
    )
}

/**
 * Định dạng đối tượng Date thành chuỗi dd/mm/yyyy
 */
// Birthday helpers removed (field hidden)

/**
 * Định dạng chuỗi nhập vào để tự động thêm dấu / khi nhập ngày tháng
 */
// Birthday helpers removed (field hidden)

/**
 * Chuyển đổi chuỗi ngày/tháng/năm thành timestamp/1000
 */
// Birthday helpers removed (field hidden)

export default CustomerForm
